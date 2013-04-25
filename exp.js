Utils = {
    replace: function(str, info) {
      var t;
      for (id in info) {
        t = '$' + id + '$';
        str = str.replace(t, info[id]);
      }
      return str;
    }
};
function E() {
    this.init();
}
E.R = [0.75,0.15,0.05,0.05];
E.ALG = {
    'PMLB': PMLB,
    'Wheel': Wheel,
    'Enum': Enum,
    'PriorityQueue': PriorityQueue
};
E.Rank = [5,10,10,10,10,40,80,80,80,80];
//cpu,memory,bandwidth,storage
E.VM = [[1,512,12,60],[4,512,12,60],[1,2048,12,60],[1,512,48,60],[1,512,12,1024],
        [4,2048,48,1024],[16,2048,48,1024],[4,4096,48,1024],[4,2048,96,1024],[4,2048,48,4096] ];
      //  [8,4096,192,4096],[32,4096,192,4096],[8,8192,192,4096],[8,4096,768,4096],[8,4096,192,16384]];
        //used,total,remain
E.M = [ [[0,0,0,0], [10,2704,200,17000], [0.5, 128, 1, 10]], 
           [[0,0,0,0], [40,2748,200,1700], [0.5, 128, 1, 10]], 
           [[0,0,0,0], [10,8704,200,1700], [0.5, 128, 1, 10]], 
           [[0,0,0,0], [10,2748,800,1700], [0.5, 128, 1, 10]] ]; 

//E.M = [ [[0,0,0,0], [40,8704,800,17000], [0.5, 128, 1, 10]], 
  //      [[0,0,0,0], [40,8704,800,17000], [0.5, 128, 1, 10]], 
    //       [[0,0,0,0], [40,8704,800,17000], [0.5, 128, 1, 10]], 
      //     [[0,0,0,0], [40,8704,800,17000], [0.5, 128, 1, 10]] ]; 
E._TEMPLATE = {
    LI: '<li><a href="#$id$">$name$</a></li>',
    TAB: ['<div id="$id$" style="height:500px;overflow:auto;white-space:nowrap;">',
            '<div class="pic" style="display:inline-block;width:1000px;height:500px;overflow:auto;white-space:nowrap;float:left;">',        
            '</div>',
            '<div class="print"style="display:inline-block;width:230px;height:500px;overflow:auto;white-space:normal;border-color:#aaa;border-style:solid;border-width:0px;border-left-width:1px;margin-left:10px">',
            '</div>',
	     '</div>'].join(""),
    STATE:'$r$/$t$',
    ADDM:'<div style="width:230px;overflow:auto;white-space:nowrap;text-align:left;">Add a machine</div>',
    DEPLOY: '<div style="width:230px;overflow:auto;white-space:nowrap;text-align:left;"><b>$indx$</b>.Deploy $vm$ in $id$ machine</div>'
};
E.tabId = 1;
E.color = ['#a9baff', '#F38630', '#E0E4CC', '#7D4F6D', '#21323D', "#ff0", "#0ff", "#f0f"];
E.getPerforVector = function (m) {
    var n = m.length;   
    var l = m[0][0].length;
    var res = [];
    for (var i = 0; i != n; i ++) {
        res[i] = [];
        for (var j = 0; j != l; j ++) {
            res[i][j] = 1.0 - m[i][0][j] / (m[i][1][j] - m[i][2][j] + 0.0);
        }
    }
    return res;
}
E.getDeltaPerforVector = function(p, a) {
    var n = p.length;
    var l = a.length;
    var res = [];
    for (var i = 0; i != n; i ++) {
        res[i] = [];
        for (var j = 0; j != l; j ++) 
            res[i][j] = p[i][j] - a[j];
    }
    return res;
}
E.getAvePerforVector =  function(m) {
    var n = m.length;
    var l = m[0].length;
    var res = [];
    for (var j = 0; j != l; j ++) {
        res[j] = 0.0;
        for (var i = 0; i != n; i ++)
            res[j] += m[i][j];
        res[j] /= n;
    }
    return res;        
}

E.calcLoad = function(m) {
    var pv = E.getPerforVector(m);
    var dp = E.getDeltaPerforVector(pv, E.getAvePerforVector(pv));
    var n = dp.length;
    var l = 4;
    var res = [];
    for (var i = 0; i != n; i ++) {
        res[i] = 0;
        for (var j = 0; j != l; j ++)
            res[i] += dp[i][j] * E.R[j];
    }
    var ave = 0;
    for (var i = 0; i != n; i ++) 
        ave += res[i];
    ave /= n; 
    var tmp = 0;
    for (var i = 0; i != n; i ++)
        tmp += (res[i] - ave) * (res[i] - ave);
    return tmp;
}
E.fn = E.prototype = {
    dawn    : function(alg, indx) {
        var machines = [];
        var self = this;
        var curStatu;
        for (var i = 0; i != self.originMachineGroup; i ++) 
            for (var j = 0; j < 4; j ++) 
                machines.push(new Machine(E.M[j], self.algs[alg]));
        for (var i = 0; i != indx; i ++) {
            curStatu = self.info[alg][i];
            if (curStatu.mid >= machines.length) {
               for (var j = 0; j < 4; j ++)
                machines.push(new Machine(E.M[j], self.algs[alg]));
            }
            machines[curStatu.mid].update(curStatu.order);
        }
        self.containers[alg].pic.text("");
        for (var i = 0, len = machines.length; i != len; i ++) machines[i].draw();
    },
    update   : function(alg, indx, vm, id) {
               var deploy;
               var self = this;
               if (id !== undefined) {
                   this.info[alg].push({'mid':id,'index':indx,'order':vm});
                   deploy = $(Utils.replace(E._TEMPLATE.DEPLOY, {'indx':indx,'vm':vm,'id':id}));
                   this.machines[alg][id].update(vm);
                   this.containers[alg].print.append(deploy);
                   deploy.button().click(function(e) {
                     var t = $(this);
                     self.dawn(alg, indx);
                     if (t.hasClass('click')) return;
                     else {
                        t.parent().find('.click').removeClass('click');
                        t.addClass('click');
                     }  
                     //   return false; 
                   });
               } else {
                    this.containers[alg].print.append($(E._TEMPLATE.ADDM));
		    this.addMachineGroup(alg);
		    var tid = this.algs[alg].getNextMachineIdx(self.proxy(self.machines[alg]),vm);
		    if (tid == -1)  alert(1);
		    this.update(alg, indx, vm, tid);
               }
    },
    getAmount: function() {
        return $("#amount").val();
    },
    setState: function(r,t) {
        $("#state").text(Utils.replace(E._TEMPLATE.STATE,{'r':r,'t':t})); 
        $( "#progressbar" ).progressbar({
              value: r,
                max:t
        });
    },
    proxy: function(machines) {
        var m = [];
        for (var i = 0, len = machines.length; i != len; i ++) m.push(machines[i].data);
        return m;
    },
    sumary: function() {
        var cur = 0;
        var deployAmount = new PointChart("#deployAmount",this.labels, '部署虚拟机数量');
        var deployLoad = new PointChart("#deployLoad", this.labels, '负载均衡');
        for (alg in this.algs) {
            deployAmount.add(this.amounts[alg], E.color[cur], alg);
            deployLoad.add(this.lbs[alg], E.color[cur ++], alg);
        }
        deployAmount.draw();
        deployLoad.draw();
    },
    clac: function(cur, total) {
        var self = this;
        var id;
        var order;
        if (cur > total)  {
            self.sumary();
            return;
        }
        order = E.VM[Math.floor((Math.random() - 0.0000001) * E.VM.length)];
        for (alg in self.algs) {
            id = self.algs[alg].getNextMachineIdx(self.proxy(self.machines[alg]),order);
            if (id == -1)  self.update(alg, cur, order);
            else self.update(alg, cur, order, id);
            if ( Math.floor(cur / this.cut) * this.cut == cur) {
                this.amounts[alg].push(this.machines[alg].length);
                this.lbs[alg].push(E.calcLoad(self.proxy(this.machines[alg])));
            }
        }
            if ( Math.floor(cur / this.cut) * this.cut == cur) {
                this.labels.push(cur);
            }
        self.setState(cur, total);
        setTimeout(function() {
                self.clac.apply(self,[cur + 1, total]);
            }, 0);
    },
    start: function() {
        this.setState(this.curFinish = 0, this.getAmount());
        this.cut = Math.floor(this.getAmount() / 10);
        this.clac(1, this.getAmount());
    },
    newContainer: function(name) {
        var id = 'tab-' + E.tabId++;
        $('ul').prepend($(Utils.replace(E._TEMPLATE.LI, {'name':name, 'id': id})));
        $('#tabs').append($(Utils.replace(E._TEMPLATE.TAB, {'id': id})));
        return {
                    pic     : $('#' + id + ' .pic'),
                    print   : $('#' + id + ' .print')
        };
    },
    addMachineGroup: function(alg, num) {
        for (var i = 0; i < 4; i ++) 
            this.machines[alg].push(new Machine(E.M[i], this.algs[alg]));
        if (typeof num == 'number') {
            for (var i = 1; i < num; i ++) this.addMachineGroup(alg); 
        }
        return  this.machines[alg].length - 1;
    },
    addAlg: function() {
        var alg;
        for (var i = 0, len =  arguments.length; i != len; i ++) {
            alg = arguments[i];
            this.containers[alg] = this.newContainer(alg);
            this.algs[alg] = new E.ALG[alg](this.containers[alg].pic);
        }
    },
    clearContainer: function() {
        for (alg in this.containers) {
            this.containers[alg].pic.text("");
            this.containers[alg].print.text("");
        }
    },

    init: function() {
        var self = this;
        this.containers = {};
        this.algs =  {};
        this.machines = {};
        this.amounts = {};
        this.lbs = {};
        this.info = {};
        this.addAlg("PMLB", 'Wheel', 'Enum', 'PriorityQueue');
        $( "#tabs" ).tabs();
        $("#start").button().click(function(event){
            self.clearContainer();
            for (alg in self.algs) {
                self.machines[alg] = [];
                self.addMachineGroup(alg, 2);
                self.originMachineGroup = 2;
                self.amounts[alg] = [];
                self.labels = [];
                self.lbs[alg] = [];
                self.info[alg] = [];
            }
            self.start();
        });
    }
};
