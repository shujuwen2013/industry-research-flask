function scatter(scatter_variables, id_name, data) {
    // CSV section
    var body = d3.select('div#explorer')
    var selectData = scatter_variables

    // Default x y dimension
    var xDim = selectData[0]['text']
    var yDim = selectData[0]['text']

    // Select X-axis Variable
    var span = body.append('span')
        .text('横轴变量: ')
    var yInput = body.append('select')
        .attr('id', 'xSelect')
        .on('change', xChange)
        .selectAll('option')
        .data(selectData)
        .enter()
        .append('option')
        .attr('value', function(d) {
            return d.text
        })
        .text(function(d) {
            return d.text;
        })
    body.append('br')

    // Select Y-axis Variable
    var span = body.append('span')
        .text('纵轴变量: ')
    var yInput = body.append('select')
        .attr('id', 'ySelect')
        .on('change', yChange)
        .selectAll('option')
        .data(selectData)
        .enter()
        .append('option')
        .attr('value', function(d) {
            return d.text
        })
        .text(function(d) {
            return d.text;
        })
    body.append('br')

    // Variables
    var body = d3.select('div#explorer')
    var margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    }
    var h = 600 - margin.top - margin.bottom
    var w = 800 - margin.left - margin.right
    var formatFloat = d3.format('.2f')

    // Scales
    var colorScale = d3.scaleOrdinal(d3.schemeCategory20)
    var xScale = d3.scaleLinear()
        .domain([
            d3.min([0, d3.min(data, function(d) {
                return d[xDim]
            })]),
            d3.max([0, d3.max(data, function(d) {
                return d[xDim]
            })])
        ])
        .range([0, w])
    var yScale = d3.scaleLinear()
        .domain([
            d3.min([0, d3.min(data, function(d) {
                return d[yDim]
            })]),
            d3.max([0, d3.max(data, function(d) {
                return d[yDim]
            })])
        ])
        .range([h, 0])
    // SVG
    var returnCachedLayout = false;

    var zoom = d3.zoom()
        //.scaleExtent([0, 50])
        //.translateExtent([[-100, -100], [w + 90, h + 100]])
        .on("start", function() {
            returnCachedLayout = true;
            zoomed()
        })
        .on("zoom", zoomed)
        .on("end", function() {
            returnCachedLayout = false;
            zoomed()
        });

    var svg = body.append('svg')
        .attr('height', h + margin.top + margin.bottom)
        .attr('width', w + margin.left + margin.right)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(zoom);

    // background
    svg.append("rect")
        .attr("width", w)
        .attr("height", h)
        .style({
            "fill": "transparent",
            "shape-rendering": "crispEdges"
        });

    // X-axis
    var xAxis = d3.axisBottom(xScale)
        .tickFormat(formatFloat)
        .tickSize(-h)
        .ticks(5)

    svg.append("g")
        .attr('class', 'axis')
        .attr("id", "xAxis")
        .attr('transform', 'translate(0,' + h + ')')
        .call(xAxis);

    svg.append('text') // X-axis Label
        .attr('id', 'xAxisLabel')
        .attr('x', w - 5)
        .attr('y', h - 5)
        .attr('dy', '0em')
        .style('text-anchor', 'end')
        .style('font-size', '12px')
        .text(xDim);

    // Y-axis
    var yAxis = d3.axisLeft(yScale)
        .tickFormat(formatFloat)
        .tickSize(-w)
        .ticks(5);

    svg.append('g')
        .attr('class', 'axis')
        .attr('id', 'yAxis')
        .call(yAxis);

    svg.append('text') // y-axis Label
        .attr('id', 'yAxisLabel')
        .attr('transform', 'rotate(-90)')
        .attr('x', -5)
        .attr('y', 0)
        .attr('dy', '1em')
        .style('text-anchor', 'end')
        .style('font-size', '12px')
        .text(yDim);

    //all the other stuffs
    var objects = svg.append("svg")
        .classed("objects", true)
        .attr("width", w)
        .attr("height", h);

    /* Initialize tooltip */
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return 'ID: ' + d[id_name] +
                '<br/>' + xDim + ': ' + formatFloat(d[xDim]) +
                '<br/>' + yDim + ': ' + formatFloat(d[yDim])
        });

    /* Invoke the tip in the context of your visualization */
    objects.call(tip)

    var label_array = []
    var anchor_array = []


    // Circles
    var circles = objects.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .classed('dot', true)
        .attr('r', '4')
        .attr('cx', function(d) {
            return xScale(d[xDim])
        })
        .attr('cy', function(d) {
            return yScale(d[yDim])
        })
        .attr('fill', function(d, i) {
            return colorScale(i)
        })
        .on('mouseover', function(d) {
            d3.select(this)
                .transition()
                .duration(10)
                .attr('r', 6)
                .attr('stroke-width', 0)
            tip.show(d)
        })
        .on('mouseout', function(d) {
            d3.select(this)
                .transition()
                .duration(10)
                .attr('r', 4)
                .attr('stroke-width', 0)
            tip.hide(d)
        })
    //

    var labelPadding = 3;

    var label = fc.layoutTextLabel()
        .padding(labelPadding)
        .value(function(d) {
            return d[id_name];
        });


    var strategyCache = function(strategy) {
        var cachedLayout;

        var cache = function(layout) {
            if (!returnCachedLayout) {
                cachedLayout = strategy(layout);
                // determine the offset applied by the layout
                for (var i = 0; i < layout.length; i++) {
                    cachedLayout[i].dx = layout[i].x - cachedLayout[i].x;
                    cachedLayout[i].dy = layout[i].y - cachedLayout[i].y;
                }
            } else {
                // update the location of each label, including the offset
                for (var i = 0; i < layout.length; i++) {
                    cachedLayout[i].x = layout[i].x - cachedLayout[i].dx;
                    cachedLayout[i].y = layout[i].y - cachedLayout[i].dy;
                }
            }
            return cachedLayout;
        };
        return cache;
    };
    // construct a strategy that uses the "greedy" algorithm for layout, wrapped
    // by a strategy that removes overlapping rectangles.
    var strategy = strategyCache(fc.layoutRemoveOverlaps(fc.layoutGreedy()));

    // create the layout that positions the labels
    var labels = fc.layoutLabel(strategy)
        .size(function(_, i, g) {
            // measure the label and add the required padding
            var textSize = d3.select(g[i])
                .select("text")
                .node()
                .getBBox();
            return [textSize.width + labelPadding * 2, textSize.height + labelPadding * 2];
        })
        .position(function(d) {
            return [xScale(d[xDim]), yScale(d[yDim])];
        })
        .component(label);

    objects.datum(data)
        .call(labels);

    var labelStyle = {
        "fill": "transparent",
        "stroke-width": "0",
        "fill-opacity": "0",
    };

    d3.selectAll(".label rect").style(labelStyle);
    d3.selectAll(".label circle").style(labelStyle);

    function yChange() {
        var value = this.value // get the new y value
        yDim = value // record dimension name
        yScale // change the yScale
            .domain([
                d3.min([0, d3.min(data, function(d) {
                    return d[value]
                })]),
                d3.max([0, d3.max(data, function(d) {
                    return d[value]
                })])
            ])
        yAxis.scale(yScale) // change the yScale
        d3.select('#yAxis') // redraw the yAxis
            .transition().duration(50)
            .call(yAxis)
        d3.select('#yAxisLabel') // change the yAxisLabel
            .text(value)

        xScale // change the yScale
            .domain([
                d3.min([0, d3.min(data, function(d) {
                    return d[xDim]
                })]),
                d3.max([0, d3.max(data, function(d) {
                    return d[xDim]
                })])
            ])
        xAxis.scale(xScale) // change the yScale
        d3.select('#xAxis') // redraw the yAxis
            .transition().duration(50)
            .call(xAxis)

        d3.selectAll('.dot') // move the circles
            .transition().duration(50)
            .delay(function(d, i) {
                return i * 5
            })
            .attr('cx', function(d) {
                return xScale(d[xDim])
            })
            .attr('cy', function(d) {
                return yScale(d[yDim])
            })

        labels = fc.layoutLabel(strategy)
            .size(function(_, i, g) {
                // measure the label and add the required padding
                var textSize = d3.select(g[i])
                    .select("text")
                    .node()
                    .getBBox();
                return [textSize.width + labelPadding * 2, textSize.height + labelPadding * 2];
            })
            .position(function(d) {
                return [xScale(d[xDim]), yScale(d[yDim])];
            })
            .component(label);

        objects.datum(data)
            .call(labels);

    }

    function xChange() {
        var value = this.value // get the new x value
        xDim = value // record dimension name
        xScale // change the xScale
            .domain([
                d3.min([0, d3.min(data, function(d) {
                    return d[value]
                })]),
                d3.max([0, d3.max(data, function(d) {
                    return d[value]
                })])
            ])
        xAxis.scale(xScale) // change the xScale
        d3.select('#xAxis') // redraw the xAxis
            .transition().duration(50)
            .call(xAxis)
        d3.select('#xAxisLabel') // change the xAxisLabel
            .text(value)

        yScale // change the xScale
            .domain([
                d3.min([0, d3.min(data, function(d) {
                    return d[yDim]
                })]),
                d3.max([0, d3.max(data, function(d) {
                    return d[yDim]
                })])
            ])
        yAxis.scale(yScale) // change the xScale
        d3.select('#yAxis') // redraw the xAxis
            .transition().duration(50)
            .call(yAxis)

        d3.selectAll('.dot') // move the circles
            .transition().duration(50)
            .delay(function(d, i) {
                return i * 5
            })
            .attr('cx', function(d) {
                return xScale(d[xDim])
            })
            .attr('cy', function(d) {
                return yScale(d[yDim])
            })


        labels = fc.layoutLabel(strategy)
            .size(function(_, i, g) {
                // measure the label and add the required padding
                var textSize = d3.select(g[i])
                    .select("text")
                    .node()
                    .getBBox();
                return [textSize.width + labelPadding * 2, textSize.height + labelPadding * 2];
            })
            .position(function(d) {
                return [xScale(d[xDim]), yScale(d[yDim])];
            })
            .component(label);

        objects.datum(data)
            .call(labels);

    }

    function zoomed() {

        svg.select("#xAxis").call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
        svg.select("#yAxis").call(yAxis.scale(d3.event.transform.rescaleY(yScale)));
        
        objects.selectAll(".dot")
            .attr('cx', function(d) {
                return d3.event.transform.rescaleX(xScale)(d[xDim])
            })
            .attr('cy', function(d) {
                return d3.event.transform.rescaleY(yScale)(d[yDim])
            })

        labels = fc.layoutLabel(strategy)
            .size(function(_, i, g) {
                // measure the label and add the required padding
                var textSize = d3.select(g[i])
                    .select("text")
                    .node()
                    .getBBox();
                return [textSize.width + labelPadding * 2, textSize.height + labelPadding * 2];
            })
            .position(function(d) {
                return [d3.event.transform.rescaleX(xScale)(d[xDim]), d3.event.transform.rescaleY(yScale)(d[yDim])];
            })
            .component(label);

        objects.datum(data)
            .call(labels);

    }

    function transform(d) {
        return "translate(" + xScale(d[xDim]) + "," + yScale(d[yDim]) + ")";
    }
}