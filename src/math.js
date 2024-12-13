class Spline
{
    points = [];
    mx = [];
    my = [];
    q = [0];
    p = [0];
    ux = [0];
    uy = [0];

    maxMoment = 1;

    constructor(points, skipCoefficient, momentSpeedupCoefficient, precision, digitPrecision = 0, distanceNormalizationCoefficient) {
        this.points = points;
        this.precision = precision;
        this.digitPrecision = digitPrecision;
        this.skipCoefficient = skipCoefficient;
        this.momentSpeedupCoefficient = momentSpeedupCoefficient;
        this.distanceNormalizationCoefficient = distanceNormalizationCoefficient;
        this.preprocess();
    }

    x(k) {
        return k/this.points.length;
    }

    h(k) {
        return this.x(k) - this.x(k-1);
    }

    lamd(k) {
        return (this.h(k))/(this.h(k)+this.h(k+1));
    }

    d(k, t) {
        let f0 = (this.points[k+1][t] - this.points[k][t])/(this.x(k+1) - this.x(k));
        let f1 = (this.points[k][t] - this.points[k-1][t])/(this.x(k) - this.x(k-1));
        return 6 * (f0 - f1)/(this.x(k+1) - this.x(k-1)); 
    }

    preprocess() {
        let n = this.points.length - 1;
        this.q = [...Array(n)]
        this.p = [...Array(n)]
        this.ux = [...Array(n)]
        this.uy = [...Array(n)]
        this.mx = [...Array(n+1)]
        this.my = [...Array(n+1)]
        this.uy[0] = this.ux[0] = this.q[0] = this.mx[0] = this.my[0] = 0;
        for ( let i = 1; i<n; i++ ) {
            this.p[i] = this.lamd(i)*this.q[i-1] + 2;
            this.q[i] = (this.lamd(i) - 1)/this.p[i];
            this.ux[i] = (this.d(i, 'x') - this.lamd(i)*this.ux[i-1])/this.p[i];
            this.uy[i] = (this.d(i, 'y') - this.lamd(i)*this.uy[i-1])/this.p[i];
        }

        this.mx[0] = this.my[0] = this.mx[n] = this.my[n] = 0;
        for ( let i = n-1; i>=1; i-- ) {
            this.mx[i] = this.ux[i] + this.q[i]*this.mx[i+1];
            this.my[i] = this.uy[i] + this.q[i]*this.my[i+1];
            this.maxMoment = Math.max(this.my[i], this.mx[i]);
        }
    }

    s(x, k, m, x0, x1) {
        let w0 = (1/6) * m[k-1] * (this.x(k) - x) ** 3 + (1/6)*m[k]*(x-this.x(k-1))**3;
        let w1 = (x0 - (1/6)*m[k-1]*this.h(k)*this.h(k))*(this.x(k)-x);
        let w2 = (x1 - (1/6)*m[k]*this.h(k)*this.h(k))*(x-this.x(k-1));
        return (w0 + w1 + w2)/this.h(k);
    }

    round(n) {
        return Math.round(n*(10 ** this.digitPrecision))/(10 ** this.digitPrecision);
    }

    *nextPoint(forCompilation=false) {
        let k = 1;
        while ( k < this.points.length ) {
            let dt = (this.x(k)-this.x(k-1));
            let step = dt / this.precision;
            // we want to minimize point near center (low moment) and maximize at the ends (high moment) so step should be variable
            
            // if moment is high we should most likely reduce point skipping
            let startNomentLength = Math.sqrt(this.mx[k-1]**2 + this.my[k-1]**2)/this.maxMoment
            let endNomentLength = Math.sqrt(this.mx[k]**2 + this.my[k]**2)/this.maxMoment

            let mDet = (this.mx[k-1] * this.my[k] - this.mx[k] * this.my[k-1])/(this.maxMoment**2)

            let L = 1/(Math.pow(startNomentLength, this.momentSpeedupCoefficient));
            let R = 1/(Math.pow(endNomentLength, this.momentSpeedupCoefficient))

            // we should scale the amount of points by the inverse of distance between controll points
            // because 2 points close to each other with high moment usually mean a very curvy curve

            for ( let x = 0; x<=this.precision; x++ ) {
                yield {
                    x: this.round(this.s(this.round(this.x(k-1)+x*step), k, this.mx, this.points[k-1]['x'], this.points[k]['x'])), 
                    y: this.round(this.s(this.round(this.x(k-1)+x*step), k, this.my, this.points[k-1]['y'], this.points[k]['y'])),
                    ...(!forCompilation ? 
                    {
                        isControllPoint: x == 0,
                        sM: startNomentLength,
                        eM: endNomentLength,
                        mDet,
                        sx: this.mx[k-1]/this.maxMoment,
                        sy: this.my[k-1]/this.maxMoment,
                        ex: this.mx[k]/this.maxMoment,
                        ey: this.my[k]/this.maxMoment,
                        u: this.round(this.x(k-1)+x*step)
                    } : 
                    {
                        u: this.round(this.x(k-1)+x*step)
                    }
                    )
                } 
                let dx = -4*this.skipCoefficient*((x/this.precision)-0.5)**2 + this.skipCoefficient;
                dx *= (R-L)*(x/this.precision) + L;
                // console.log(dx)
                dx = Math.max(0,dx);
                // if ( x % 5 == 0 ) console.log((R-L)*(x/this.precision) + L)
                x += dx;
                x = Math.floor(x);
                x = Math.min(x, this.precision)
            }
            k++;
        }
    }
}