# Wyjaśnienie co się dzieje w środku i technik zastosowanych

Plik czytajmnie stworzony w celu mini dokumentacji kodu i procesu

## 1. Edytor

Do manualnego odwtorzenia "bazowego kształtu" napisałem customowy "edytor spline'ów", który można utuchomić w dowolnej przeglądarce po prostu otwierając plik `spline_renderer.html`

Edytor jest dosyć skomplikowany w użytku i niezbyt user friendly, aczkolwiek jest całkiem wygodny jeżeli umie sie z niego korzystać

Instrukcja obsługi:
- Edytor robi autozapis co sekunde (bardzo optymalne rozwiązanie, które na pewno nie powoduje problemów)
- Punkt kluczowy krzywej dodajemy lewym przyciskiem myszy
- Trzymając shift możemy widzieć podgląd na żywo jaką krzywą utworzymy po dodaniu nowego punktu
- Kolejną krzywą możemy dodać guzikiem po prawej `Nowy objekt` (błąd ortograficzny spowodowany zbyt dużym przyzwyczajeniem do języka angielskiego, przepraszam)
- Możemy także usunąć aktualnie zaznaczony obiekt za pomocą guzika `Usun obiekt`
- Możemy dodawać i odejmować konkretne punkty kontrolne za pomocą listy nazwanej `Punkty`
- Po dodaniu nowego punktu możemy cofnąc jego dodanie za pomocą `CTRL+Z`
- Możemy także cofnąć COFNIĘCIE za pomocą `CTRL+X`
- Podgląd naszego aktualnie edytowanego napisu możemy "przesuwać" i "zoomować" za pomocą przeciągania myszy trzymając prawy przycisk myszy oraz za pomocą scrolla na myszce
- Po prawej stronie ekranu możemy znaleźć tone parametrów, robią one różne rzeczy, które będę tłumaczył w następnych punktach, ale ważnym aspektem jest to że mamy parametry z podziałem na "LOD" (level of detail) i ogólne, dzięki czemu możemy zaznaczyć, który obiekt (krzywa) ma być renderowana z większymi detalami, a która z mniejszymi
- Obok list aktualnie edytowanych obiektów znajduje się menu do zaznaczenia z jakim poziomem detalu chcielibyśmy renderować nasz obiekt. Domyślną wartością dla nowej krzywej jest `medium`
- Na dole, pod ekranem z krzywą znajdują się 4 guziki: Możliwość dodania obrazka wyświetlanego w tle, guzik do załadowania stanu z pliku JSON, guzik do pobrania aktualnego stanu jako plik JSON oraz guzik do pobierania aktualnego stanu w formacie konkursowym
- Na górze nad ekranem znajduje się możliwość wyboru rozdzielczości wyświetlanego ekranu oraz mała metryka sumy długości wszystkich wektorów `U`

Uwagi:
- Aplikacja nie jest zbytnio responsywna, nie polecam używać opcji zoomowania w przeglądarce
- W przypadku dziwnego zachowania aplikacji w trakcie wczytywania danych należy wyczyścić pamięć przeglądarki dla tego pliku (przede wszystkim `localStorage`)

## 2. Metody optymalizacji

Uwagi:
- Większość metod dostępnych w aplikacji nie działa, ponieważ ostatni algorytm kompletnie zdeklasował pozostałe i uznałem że moge je "wykomentować" po prostu

### 1. Distance Normalization Coefficient
Ten współczynnik finalnie nic nie robił i nie pamiętam co miał robić bo dodałem go ponad miesiąc temu (na dzień pisania tej dokumentacji)

### 2. Heat Map Sensitivity
W kodzie można włączyć tryb renderowania, który zwiększa "czerwoność" napisu przy miejscach z dużą gęstością punktów. Ten parametr służył do kontrolowania tej funkcji 

### 3. Deriviatvie Angle Point Reduction
Pomysł za algorytmem był taki że jeżeli znamy drugą pochodną w każdym punkcie kluczowym to może możemy liniowo zaproksymować sobie wartość tej drugiej pochodnej w danym punkcie za pomocą interpolacji liniowej.

Znając wartość drugiej pochodnej w danym punkcie  (nijako przyśpieszenia) możemy policzyć kąt wektorów między pochodną drugiego a pierwszego stopnia w danym punkcie i pomnożyć przez długość wektora drugiej pochodnej. W ten sposób dostaniemy współczynnik, który mniej więcej będzie nam mówił czy czasem nie wlecimy zaraz w ostry zakręt

W "ostrych zakrętach" chcielibyśmy mieć raczej więcej puntków niż dla prostych lini

W praktyce algorytm nawet jako tako się sprawdzał, ale finalnie znalazłem alternatywe

### 4. Ramer-Douglas-Peucker epsilon
Nie zdążyłem zmienić nazwy tego wspólczynnika po użyciu poprzednieog algorytmu, aczkolwiek aktualnie służy on do ustawiania współczynnika dla algorytmu Visvalingam–Whyatt

Algorytm w dużym skrócie polega na redukowania "mniej ważnych puntków" gdzie ważność punktu ustalamy na podstawie pola trójkąta trzech punktów w okół naszego obliczanego punktu

Okazuje się że ten algorytm sprawdza się świetnie do optymalizacji napisów, w praktyce lepiej niż nawet Ramer–Douglas–Peucker

### 5. Rounding

Mówi ile liczb po przecinku mamy zachować przy obliczaniu, w praktyce przy formie zapisu jaką stosowałem (X,Y - wartości pixeli) można zostawić nawet jedną liczbe po przecinku i dalej będziemy mieli ładny napis

### 6. Skip coefficient i Moment Speedup Coefficient

Pierwszy algorytm optymalizacyjny, który napisałem opierał się na prostym pomyśle, którego nie ma co opisywać bo długoterminowo widzę że nie miał najmniejszego sensu

### 7. Line Approximation Angle
Długoterminowo widzę że to jest po prostu Ramer-Douglas-Peucker epsilon (tym razem dla faktycznego algorytmu Ramer-Douglas-Peucker) aczkolwiek zaimplementowany w zdecydowanie bardziej naiwny sposób - ale troche efektów dawał

### 8. Base Control Point Count
Bazowa ilość punktów, którą ma wygenerować obiekt `Spline` pomiędzy punktami kontrolnymi

Co ciekawe, algorytmt typu Visvalingam–Whyatt działały lepiej gdy ta wartość była większa, najpewniej dlatego że miały większą póle punktów, z których mogły optymalizować i dobierać

### 9. Sama technika wybierania krzywych
Zauważyłem że algorytmy optymalizacji krzywych, które stosowałem, o wiele lepiej radzą sobie (zwłaszcza przy ostnych zakrętach) gdy podziele mocno "pokręcone" literki (typu o, a, u, w) na większą ilość krzywych (niż 1)

## 3. Post processing 

Finalnie eksperymentowałem jeszcze z "upiększeniem" napisu za pomocą symulowania kólki od długopisu.

Pomysł był taki że kólka od długopisu obraca się w środku i "pobiera tusz" ale często robi to nierównomiernie. Skojarzyło mi się to z czymś co możnaby było przedstawić za pomocą sinusa z lekkim szumem - efekt finalny okazał się być nawet ładny

Przy pisaniu czegoś długopisem często zdarza nam się używać różnej siły nacisku, co wpływa na grubość czcioni - aby to uwzględnić w moim "post processingu" dodałem zwykła liniową zależnośc, która okazała się być całkiem ładna
