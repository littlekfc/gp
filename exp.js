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
E.ALG = {
    'PMLB': PMLB,
    'Wheel': Wheel,
    'Enum': Enum
};
//cpu,memory,bandwidth,storage
E.VM = [[1,512,12,60],[4,512,12,60],[1,2048,12,60],[1,512,48,60],[1,512,12,1024],
        [4,2048,48,1024],[16,2048,48,1024],[4,4096,48,1024],[4,2048,96,1024],[4,2048,48,4096],
        [8,4096,192,4096],[32,4096,192,4096],[8,8192,192,4096],[8,4096,768,4096],[8,4096,192,16384]];
        //used,total,remain
E.M = [[0,0,0,0], [40,8704,2000,17000], [0.5, 128, 1, 10]];
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
E.fn = E.prototype = {
    dawn    : function(alg, indx) {
        var machines = [];
        var self = this;
        var curStatu;
        for (var i = 0; i != self.originMachine; i ++) machines.push(new Machine(E.M, self.algs[alg]));
        for (var i = 0; i != indx; i ++) {
            curStatu = self.info[alg][i];
            if (curStatu.mid == machines.length) {
                machines.push(new Machine(E.M, self.algs[alg]));
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
                    this.update(alg, indx, vm, this.addMachine(alg) );
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
        for (alg in this.algs) {
            deployAmount.add(this.amounts[alg], E.color[cur ++], alg); 
        }
        deployAmount.draw();
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
    addMachine: function(alg, num) {
        var m = new Machine(E.M, this.algs[alg]);
        this.machines[alg].push(m);
        if (typeof num == 'number') {
            for (var i = 1; i < num; i ++) this.addMachine(alg); 
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
        this.addAlg("PMLB", 'Wheel', 'Enum');
        $( "#tabs" ).tabs();
        $("#start").button().click(function(event){
            self.clearContainer();
            for (alg in self.algs) {
                self.machines[alg] = [];
                self.addMachine(alg, 2);
                self.originMachine = 2;
                self.amounts[alg] = [];
                self.labels = [];
                self.lbs[alg] = [];
                self.info[alg] = [];
            }
            self.start();
        });
    }
};
