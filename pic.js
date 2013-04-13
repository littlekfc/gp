function PointChart(canvas,label, name) {
    canvas = $(canvas);
    canvas.parent().find('h2').remove();
    canvas.parent().find('div').remove();
        
    this.icoContainer = $(PointChart._TEMPLATE.ICODIV);
    canvas.parent().append(this.icoContainer);
    canvas.parent().prepend($(PointChart._TEMPLATE.TITLE.replace("$name$",name)));
    this.canvas = canvas.get(0);
    this.data = {
          labels : label,
          datasets : []
    };
    this.proper = {
          //Boolean - If we show the scale above the chart data			
          scaleOverlay : false,
          
          //Boolean - If we want to override with a hard coded scale
          scaleOverride : false,
          
          //** Required if scaleOverride is true **
          //Number - The number of steps in a hard coded scale
          scaleSteps : null,
          //Number - The value jump in the hard coded scale
          scaleStepWidth : null,
          //Number - The scale starting value
          scaleStartValue : null,

          //String - Colour of the scale line	
          scaleLineColor : "rgba(0,0,0,.1)",
          
          //Number - Pixel width of the scale line	
          scaleLineWidth : 1,

          //Boolean - Whether to show labels on the scale	
          scaleShowLabels : true,
          
          //Interpolated JS string - can access value
          scaleLabel : "<%=value%>",
          
          //String - Scale label font declaration for the scale label
          scaleFontFamily : "'Arial'",
          
          //Number - Scale label font size in pixels	
          scaleFontSize : 12,
          
          //String - Scale label font weight style	
          scaleFontStyle : "normal",
          
          //String - Scale label font colour	
          scaleFontColor : "#666",	
          
          ///Boolean - Whether grid lines are shown across the chart
          scaleShowGridLines : true,
          
          //String - Colour of the grid lines
          scaleGridLineColor : "rgba(0,0,0,.05)",
          
          //Number - Width of the grid lines
          scaleGridLineWidth : 5,	
          
          //Boolean - Whether the line is curved between points
          bezierCurve : false,
          
          //Boolean - Whether to show a dot for each point
          pointDot : true,
          
          //Number - Radius of each point dot in pixels
          pointDotRadius : 3,
          
          //Number - Pixel width of point dot stroke
          pointDotStrokeWidth : 1,
          
          //Boolean - Whether to show a stroke for datasets
          datasetStroke : true,
          
          //Number - Pixel width of dataset stroke
          datasetStrokeWidth : 2,
          
          //Boolean - Whether to fill the dataset with a colour
          datasetFill : false,
          
          //Boolean - Whether to animate the chart
          animation : true,

          //Number - Number of animation steps
          animationSteps : 60,
          
          //String - Animation easing effect
          animationEasing : "easeOutQuart",

          //Function - Fires when the animation is complete
          onAnimationComplete : null
          
        };
}

PointChart.fn = PointChart.prototype;
PointChart._TEMPLATE = {
    TITLE: '<h2 style="text-align:center">$name$</h2>',
    ICODIV: '<div style="position:absolute;left:60px;top:60px;">',
    ICO: ['<div>',
            '<div style="height:10px;width:10px;background:$color$;float:left">',
            '</div>',
            '<a>&nbsp;&nbsp;$name$</a>',
          '</div>',].join("")
};

PointChart.fn.add = function(_d, color, name) {
    this.data.datasets.push({
       strokeColor : "#aaa",
       pointColor : color,
       pointStrokeColor : color,
       data : _d
   });
   this.icoContainer.append($(PointChart._TEMPLATE.ICO.replace('$color$', color).replace('$name$', name)));
}
PointChart.fn.draw = function() {
    var ctx = this.canvas.getContext("2d");
    new Chart(ctx).Line(this.data, this.proper);
}


function Machine(state, alg) {
    this.data = [];
    $.extend(true, this.data, state);
    this.alg = alg;    
}
Machine.options = {
   
	//Boolean - Whether we should show a stroke on each segment
	segmentShowStroke : true,
	
	//String - The colour of each segment stroke
	segmentStrokeColor : "#fff",
	
	//Number - The width of each segment stroke
	segmentStrokeWidth : 2,
	
	//The percentage of the chart that we cut out of the middle.
	percentageInnerCutout : 50,
	
	//Boolean - Whether we should animate the chart	
	animation : false,
	
	//Number - Amount of animation steps
//	animationSteps : 100,
	
	//String - Animation easing effect
	animationEasing : "easeOutBounce",
	
	//Boolean - Whether we animate the rotation of the Doughnut
	animateRotate : true,

	//Boolean - Whether we animate scaling the Doughnut from the centre
	animateScale : false,
	
	//Function - Will fire on animation completion.
	onAnimationComplete : null

};
Machine._TEMPLATE = {
    BODY: ['<div style="float:left;width:200px;height:200px">',
                '<div class="cpu" style="position:relative;float:left">',
                    '<canvas width=100 height=100 style= "float:left"></canvas>',
                    '<div style="position:absolute;left:5px;top:5px;">$cr$/$ct$</div>',
                '</div>',
                '<div class="memory" style="position:relative;float:left">',
                    '<canvas width=100 height=100 style= "float:left"></canvas>',
                    '<div style="position:absolute;left:5px;top:5px;">$mr$/$mt$</div>',
                '</div>',
                '<div class="bandwidth" style="position:relative;float:left">',
                    '<canvas width=100 height=100 style= "50px;float:left"></canvas>',
                    '<div style="position:absolute;left:5px;top:5px;">$br$/$bt$</div>',
                '</div>',
                '<div class="storage" style="position:relative;float:left">',
                    '<canvas width=100 height=100 style= "float:left"></canvas>',
                    '<div style="position:absolute;left:5px;top:5px;">$sr$/$st$</div>',
                '</div>',
          '</div>'].join("")
};
Machine.fn = Machine.prototype = {
   update:function(order) {
                this.data[0][0] += order[0];
                this.data[0][1] += order[1];
                this.data[0][2] += order[2];
                this.data[0][3] += order[3];
          },
   draw: function() {
                var used = "#a9baff";
                var cpu = "#F38630";
                var memory = "#E0E4CC";
                var bandwidth = "#7D4F6D";
                var storage = "#21323D";
                var body = $(Machine._TEMPLATE.BODY.replace('$cr$', this.data[0][0] + this.data[2][0])
                                               .replace('$ct$', this.data[1][0])
                                               .replace('$mr$', this.data[0][1] + this.data[2][1])
                                               .replace('$mt$', this.data[1][1])
                                               .replace('$br$', this.data[0][2] + this.data[2][2])
                                               .replace('$bt$', this.data[1][2])
                                               .replace('$sr$', this.data[0][3] + this.data[2][3])
                                               .replace('$st$', this.data[1][3]));
                this.alg.container.append(body);
                new Chart(body.find('.cpu canvas').get(0).getContext('2d')).Doughnut([{
                                                    value: this.data[0][0] + this.data[2][0],
                                                    color: used
                                                }, 
                                                {
                                                    value: this.data[1][0] - this.data[0][0] - this.data[2][0],
                                                    color: cpu
                                                }], Machine.options);
                
                new Chart(body.find('.memory canvas').get(0).getContext('2d')).Doughnut([{
                                                    value: this.data[0][1] + this.data[2][1],
                                                    color: used
                                                }, 
                                                {
                                                    value: this.data[1][1] - this.data[0][1] - this.data[2][1],
                                                    color: memory
                                                }], Machine.options);
                new Chart(body.find('.bandwidth canvas').get(0).getContext('2d')).Doughnut([{
                                                    value: this.data[0][2] + this.data[2][2],
                                                    color: used
                                                }, 
                                                {
                                                    value: this.data[1][2] - this.data[0][2] - this.data[2][2],
                                                    color: bandwidth
                                                }], Machine.options);
                new Chart(body.find('.storage canvas').get(0).getContext('2d')).Doughnut([{
                                                    value: this.data[0][3] + this.data[2][3],
                                                    color: used
                                                }, 
                                                {
                                                    value: this.data[1][3] - this.data[0][3] - this.data[2][3],
                                                    color: storage
                                                }], Machine.options);

          }
}
