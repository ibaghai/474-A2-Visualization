/**
 * Iman Baghai
 */
$(function () {
    //load data, data has been wrangled from a dataset of all Airbnb listing data
    //from open AirBnb.
    //it was an raw aggregate form used R to wrangle it to have each neighborhood
    //and average list price by neighborhood from overall price
    //and the price of listings of just individual rooms
    //and the price of listing of entire homes
    d3.csv('data/SeattleAirbnbDataFinal2.csv', function(error, allData) {
        if(error) throw error;
        //variables
        var xScale;
        var yScale;
        var choice = "Combined_Average_Price";
        var choice2 = "Average_Price_of_Private_Room";
        var choice3 = "Average_Price_of_Entire_Home/Apt";
        var margin = {
            top: 50,
            bottom: 100,
            left: 70,
            right: 50
        };

      //load  sort and filter data for each question
       var data = allData.filter(function(d) {
              return d.Rental_Type == choice
          })
          // Sort the data alphabetically
          // Hint: http://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
          .sort(function(a, b) {
              if (a.neighborhood < b.neighborhood) return -1;
              if (a.neighborhood > b.neighborhood) return 1;
              return 0;
          });

      var data2 = allData.filter(function(d) {
             return d.Rental_Type == choice2
         })
         .sort(function(a, b) {
             if (a.neighborhood < b.neighborhood) return -1;
             if (a.neighborhood > b.neighborhood) return 1;
             return 0;
         });

         data2[name] = "Average Listing Price for a Private Room";
         //var data2String = String(data2[name])
        // console.log(data2String)


         var data3 = allData.filter(function(d) {
                return d.Rental_Type == choice3
            })
            .sort(function(a, b) {
                if (a.neighborhood < b.neighborhood) return -1;
                if (a.neighborhood > b.neighborhood) return 1;
                return 0;
            });
            data3[name] = "Average Listing Price of an Entire Home/Apt";

        //create window measurements for graph
        var height = 600 - margin.bottom - margin.top;
        var width = 1300 - margin.left - margin.right;

        //creates svg that parts will be added to.
        var svg = d3.select("#vis")
            .append('svg')
            .attr('height', 600)
            .attr('width', 1300);

        //main element where the rects will be placed
        var g = svg.append('g')
            .attr('transform', 'translate(' +  margin.left + ',' + margin.top + ')')
            .attr('height', height)
            .attr('width', width);


          /*set up axes */
        var xAxisLabel = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
            .attr('class', 'axis');

        var yAxisLabel = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top) + ')');

        var xAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left + width/2) + ',' + (height + margin.top + 40) + ')')
            .attr('class', 'title');

        var yAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left - 40) + ',' + (margin.top + height/2) + ') rotate(-90)')
            .attr('class', 'title');

            // Define xAxis using d3.axisBottom(). Scale will be set in the setAxes function.
   var xAxis = d3.axisBottom();

   // Define yAxis using d3.axisLeft(). Scale will be set in the setAxes function.
   var yAxis = d3.axisLeft()
       .tickFormat(d3.format('.2s'));

   // Define an xScale with d3.scaleBand. Domain/rage will be set in the setScales function.
   var xScale = d3.scaleBand();

   // Define a yScale with d3.scaleLinear. Domain/rage will be set in the setScales function.
   var yScale = d3.scaleLinear();

   //create mouse over to grab exact price per neighborhood on mouse over*/
   var tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
          return "the average price per night in " +  d.neighborhood + " is $" + d.Average_Price;
      });
      g.call(tip);

        //This sets the xscale as an ordinal one and the yScale as a linear one based on the data set
        var setScales = function(data) {
            var neighborhoods = data.map(function(d) {return d.neighborhood});
            xScale.range([0, width])
                          .padding(0.10)
                          .domain(neighborhoods);
            var yMin =d3.min(data, function(d){
                return +d.Average_Price});
            var yMax = d3.max(data, function (d) {
                return +d.Average_Price
            });
            yScale.range([height, 0])
                         .domain([0, yMax]);
        }

        //creates the axes and the labels that are associated with them
        var setAxes = function() {

          xAxis.scale(xScale);


          yAxis.scale(yScale);


            xAxisLabel.transition().duration(1500).call(xAxis);

            yAxisLabel.transition().duration(1500).call(yAxis);

            xAxisText.text('Neighborhood')

            yAxisText.text(choice)
        }


        //This function calls the functions to draw the graphs
        var draw = function(data) {
            setScales(data);
            setAxes();

            var bars = g.selectAll('rect').data(data)

            //creates each of the bars based on the data pased and the scales set
            //and makes it so that they adjust based on the data
            bars.enter().append('rect')
                .attr('x', function(d, i){return xScale(d.neighborhood)})
                .attr('y', function(d) {
                return height;
              })
                .attr('height', 0)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)

                .attr('width', xScale.bandwidth())
                .attr('class', 'bar')
                .attr('title', function(d) {return d.neighborhood})
                .merge(bars)
                .style('fill', 'green')
                .transition()
                .duration(1500)
               .delay(function(d, i) {
                   return i * 50;
               })
               .attr('y', function(d) {
                   return yScale(d.Average_Price);
               })
               .attr('height', function(d) {
                   return height - yScale(d.Average_Price);
               })
                ;

            //removes any elements no longer supported by the data
            bars.exit().remove();


        };

        //Looks for any of the button input changes and determines which data will be used in the
        //new draw functions
        $("input").on('change', function() {
            // Get value, determine which data to load
            var val = $(this).val();
            choice = val;
            draw(data);
            if (choice == 'Average_Price_of_Private_Room') {
              draw(data2);
            }
            if (choice == 'Average_Price_of_Entire_Home/Apt') {
              draw(data3);
            }
        });

      //load and draw data on onset
       draw(data);
       if (choice == 'Average_Price_of_Private_Room') {
         draw(data2);
       }
       if (choice == 'Average_Price_of_Entire_Home/Apt') {
         draw(data3);
       }

    })
})
