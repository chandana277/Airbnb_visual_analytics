
      var Visualize = function(parent, width, height){
        var dataset, Dvariables, constansused, attributepoints, tipvarinfo, colorVar;

        var dimensions = {top:60, bottom:60, left: 60, right:60};
        var canvaswidth = width - dimensions.left - dimensions.right;
        var canvasheight = height - dimensions.top - dimensions.bottom;
        var circlecenter = {x: canvaswidth/2, y: canvasheight/2};
        var radius = Math.min(circlecenter.x, circlecenter.y);
        var color = d3.scale.category10();


        var svg = d3.select(parent)
          .append("svg")
          .attr({width:width, height:height});

        var chart = svg.append("g")
          .attr("transform", "translate("+dimensions.left + "," + dimensions.top + ")");

        var canvasborder = svg.append("g")
          .attr("transform", "translate("+dimensions.left + "," + dimensions.top + ")")

        var getangle = function(angle) {
          return {
            x: circlecenter.x + radius*Math.cos(angle),
            y: circlecenter.y + radius*Math.sin(angle)
          };
        };


        
        var vis = function(){

         
          attributepoints = Dvariables.map(function(d, i, arr){return getangle((2*Math.PI/arr.length)*i);});

          var outercircle = canvasborder.selectAll("circle").data(attributepoints);
          outercircle.exit().remove();
          outercircle.enter().append("circle");
          outercircle

          .attr({
            cx: function(d){return d.x},
            cy: function(d){return d.y},
            r: 3
          }).style("fill", "black");


         
          var offsetDistance = 7;

          var findtextposX = function(d, i) {
            var xOffset = attributepoints[i].x - circlecenter.x;
            var yOffset = attributepoints[i].y - circlecenter.y;
            var angle = Math.atan2(yOffset, xOffset);
            return attributepoints[i].x + offsetDistance*Math.cos(angle);
          };
          var findtextposY = function(d, i) {
            var xOffset = attributepoints[i].x - circlecenter.x;
            var yOffset = attributepoints[i].y - circlecenter.y;
            var angle = Math.atan2(yOffset, xOffset);
            return attributepoints[i].y + offsetDistance*Math.sin(angle);
          };
          var findanchortextpos = function(d, i) {
            var xOffset = attributepoints[i].x - circlecenter.x;
            if (xOffset >= -0.1) return "start";
            return "end";
          }
          var findtextbaseline = function(d, i) {
            var yOffset = attributepoints[i].y - circlecenter.y;
            if (yOffset > 0) return "hanging";
            return "alphabetic";
          }

          var Attribute_labels = canvasborder.selectAll("text").data(Dvariables);
          Attribute_labels.exit().remove();
          Attribute_labels.enter().append("text");
          Attribute_labels.attr({
            x: findtextposX,
            y: findtextposY,
            "font-size": 10,
            "text-anchor": findanchortextpos,
            "alignment-baseline": findtextbaseline,
            "pointer-events": "none"
          }).text(function(d){return d});

          canvasborder.append("circle")
          .attr({
            cx: circlecenter.x,
            cy: circlecenter.y,
            r: radius,
            })
            .style("stroke", "red")   
            .style("fill", "none");

          constansused = Dvariables.map(function(){return d3.scale.linear().range([0, 1]);});
          constansused.forEach(function(element, index, array){
          element.domain(d3.extent(dataset, function(d){return +d[Dvariables[index]];}));
          });

          if (colorVar) color.domain(allValuesOf(dataset, colorVar));

          var circles = chart.selectAll("circle").data(dataset);

          circles.exit().remove();

          circles.enter().append("circle");

          var getdatapoint = function(d) {
            var list = constansused.map(function(element, index, array){
              return element(d[Dvariables[index]]);}
              );
            var sum = list.reduce(function(prev, cur) {return prev + cur;});
            var pt = {x:0, y:0};
            for (var i = 0; i < attributepoints.length; i++) {
              pt.x += (list[i]/sum)*attributepoints[i].x
              pt.y += (list[i]/sum)*attributepoints[i].y
            }
            return pt;
          }

          var findX = function(d) {return getdatapoint(d).x; };

          var findY = function(d) {return getdatapoint(d).y; };

          circles.transition()
          .duration(500)
          .attr({
            cx: findX,
            cy: findY,
            r: 2
          }).style("fill", function(d){
            if (!colorVar) {return "black";}
            return color(d[colorVar]);});

          circles.on("mouseover", function(d){
            d3.select(this)
              .classed("selected", true)
              .attr("r", 8);

              

            var info = d3.select("#info");

            var nonNumeric = info.select("#nonNumeric").selectAll("p").data(tipvarinfo);
            nonNumeric.exit().remove();
            nonNumeric.enter().append("p");
            nonNumeric.text(function(varName){return varName + ":  " + d[varName]});

            if (colorVar) {
              var colorCategory = info.select("#colorCategory").selectAll("p").data([colorVar]);
              colorCategory.exit().remove();
              colorCategory.enter().append("p")

              colorCategory.text(function(d){
                console.log(data[d]);
                document.getElementById('image').style.opacity="1";
                document.getElementById('image').innerHTML = '<img width="400" height="400" src="http://localhost:5000/load_images'+ data[d]+'"/>';
                return d + ":  " + data[d]})
                .style("color", function(d){return color(data[d]);});
            }

            var numeric = info.select("#numeric").selectAll("p").data(Dvariables);
            numeric.exit().remove();
            numeric.enter().append("p");
            numeric.text(function(varName){return varName + ":  " + d[varName]});

            var coordinates = d3.mouse(svg.node());
            var bbox = svg.node().getBoundingClientRect();
            coordinates[0] += bbox.left;
            coordinates[1] += bbox.top;

            info.style({
              left: (coordinates[0] + 25) + "px",
              top: (coordinates[1] ) + "px",
            })
            .classed("hidden", false);

          })
          .on("mouseout", function(d){
            d3.select(this)
              .classed("selected", false)
              .attr("r", 2);

              var info = d3.select("#info");
              info.classed("hidden", true);
          });

        };


        vis.loadData = function(data){
          dataset = data;
          return vis;
        }

        vis.setVars = function(value){
          if (!arguments.length) return Dvariables;
          Dvariables = value;
          return vis;
        }

        vis.findtooltips = function(value) {
          if (!arguments.length) return tooltipVars;
          tipvarinfo= value;
          return vis;
        }

        vis.setColorVar = function(value) {
          if (!arguments.length) return colorVar;
          colorVar = value;
          return vis;
        }

        return vis;
      };

      var allValuesOf = function(data, variable) {
          var values = [];
          for (var i=0; i<data.length; i++){
            if (!values.includes(data[i][variable])) {
              values.push(data[i][variable]);
            }
          }
          return values;
        };

      var vis = Visualize("#visDiv", 700,440);
      var loadData = function() {

        d3.json("http://localhost:5000/load_files",
          function(dataset){
               //if(!dataset) {alert("Invalid data"); return;}

              //var isNumeric = function( n ) {
              //return !isNaN(parseFloat(n)) && isFinite(n);
            //}

            var pushtotable = function(propertyList, parent, name, type) {

              var inputlist = d3.select(parent).selectAll("g").data(propertyList);

              inputlist.exit().remove();

              var groups = inputlist.enter().append("g");
              groups.append("input");
              groups.append("text");

              inputlist.select("input")
              .attr({
                "type":type,
                "value":function(d){return d},
                "label":function(d){return d},
                "name":name
              });

              inputlist.select("text").text(function(d){return d}).append("p");
            };

            var numericProps = [];
            for (property in dataset[0]) {
              if (isNumeric(dataset[0][property])) {
                numericProps.push(property);
              }
            }
            pushtotable(numericProps, "#numeric", "numericAttribute", "checkbox");

            //adding all data attributes to tooltip table
            pushtotable(Object.keys(dataset[0]), "#tooltip", "tooltipAttribute", "checkbox");

            //find categorical vars
            var categoricalVars = [];
            for (property in dataset[0]) {
              if (allValuesOf(dataset, property).length <= 10) {
                categoricalVars.push(property);
              }
            }

            pushtotable(categoricalVars, "#colorGroup", "colorAttribute", "radio");

            vis.loadData(dataset);
            vis.setVars([]);
            vis.findtooltips([]);
            vis();
        });

        // Allow for user to adjust displayed variables and redraws vis as changes occur.
        var numericAttrSelection = d3.select("#setVars").on("change", function(d){
          var selection = document.querySelectorAll('input[name="numericAttribute"]:checked');
          var variables = [];
          for (var i=0; i<selection.length; i++) {
            variables.push(selection[i].value);
          }
          vis.setVars(variables);
          vis();
        });

        var tooltipAttrSelection = d3.select("#setTooltipDisplay").on("change", function(d){
          var selection = document.querySelectorAll('input[name="tooltipAttribute"]:checked');
          var variables = [];
          for (var i=0; i<selection.length; i++) {
            variables.push(selection[i].value);
          }

          vis.findtooltips(variables);
          vis();
        });

       

        var coloselection = d3.select("#setColorVar").on("change", function(d){
          var selection = document.querySelector('input[name="colorAttribute"]:checked');
          var val = selection.value;
          if (val == "-1") vis.setColorVar(null);
          else vis.setColorVar(val);
          vis();
        })
      }

    