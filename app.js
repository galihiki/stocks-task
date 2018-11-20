var app = angular.module('stocks',['ngMaterial']);

app.controller("StocksController", ['$scope', '$http', function($scope,$http){

    const historyValuesAmont = 6;
    const alphaVantageApiKey = 'ATUUE5G77DNAJCWV';
    stocksNames=["S&P 500 Index", "Dow 30", "Amazon.com", "Alphabet Inc.", "Nasdaq"];
    $scope.stocksSymbols=["s&p 500", "^DJI", "AMZN", "GOOGL", "^IXIC"];
    $scope.stocksInfo ={};

    initStocksInfo();

    $scope.stocksSymbols.forEach(function(stockSymbol){

        stockUrlSymbol = stockSymbol.replace('&', '%26');

        $http.get("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="
            +stockUrlSymbol+"&interval=60min&apikey="+alphaVantageApiKey)
        .then(function(ans){
            let stock = $scope.stocksInfo[stockSymbol];
            getStockValueHistory(stock, ans.data);
            stock.values.reverse();
            stock.trend =(stock.values[historyValuesAmont-1][1] >= stock.values[historyValuesAmont-2][1])? "up" : "down";
            stock.currentValue = stock.values[historyValuesAmont-1][1];
            $scope.stocksInfo[stock.symbol] = stock;
            createChart(stock.symbol);
        });
        
    });

    function initStocksInfo(){
        $scope.stocksSymbols.forEach(function(stockSymbol, index){
            $scope.stocksInfo[stockSymbol] = {};
            $scope.stocksInfo[stockSymbol]["symbol"] = stockSymbol;
            $scope.stocksInfo[stockSymbol]["name"] = stocksNames[index]; 
        });
    }

    function getStockValueHistory(stock, data){
        let index = 0;
        stock.values = [];
        stock.symbol = data["Meta Data"]["2. Symbol"];
        for(var prop in data["Time Series (60min)"]){
            var closeValue = data["Time Series (60min)"][prop]["4. close"];
            var date = new Date(prop);
            stock.values[index] = [date.getTime(), parseFloat(closeValue)];
            index++;
            if(index >= historyValuesAmont){
                break;
            }
        }
    }

    function createChart(stockSymbol){
        var container = 'container'+stockSymbol;
        var test = $scope.stocksInfo[stockSymbol]["values"];
        Highcharts.chart(container, {
            chart: {
                zoomType: 'x',
                width: 450,
                height: 200
            },
            title: {
                text: 'Stock hourly value'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'stock value'
                }
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[2]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 0.5,
                    states: {
                        hover: {
                            lineWidth: 0.5
                        }
                    },
                    threshold: null
                }
            },
    
            series: [{
                type: 'area',
                name: 'stock value',
                data: $scope.stocksInfo[stockSymbol]["values"]
            }]
        })
    }


}])