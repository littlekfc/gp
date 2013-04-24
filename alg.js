function Enum(container) {
    this.container = $(container);
    
}
Enum.fn = Enum.prototype = {
    getNextMachineIdx: function(machine, order) {
        var cur;
        for (var i = 0, len = machine.length; i != len; i ++) { 
            cur = machine[i];
            if (cur[0][0] + cur[2][0] + order[0] <= cur[1][0])
                if (cur[0][1] + cur[2][1] + order[1] <= cur[1][1])
                    if (cur[0][2] + cur[2][2] + order[2] <= cur[1][2]) 
                        if (cur[0][3] + cur[2][3] + order[3] <= cur[1][3]) {
                            return i;
                        }
        }
        return -1;
    }
}
function Wheel(container) {
    this.container = $(container);
    this.curId = 0;
}
Wheel.fn = Wheel.prototype = {
    
    getNextMachineIdx: function(machine, order) {
        var cur;
        for (var i = this.curId, len = this.curId + machine.length; i != len; i ++) {
            cur = machine[i % machine.length];
            if (cur[0][0] + cur[2][0] + order[0] <= cur[1][0])
                if (cur[0][1] + cur[2][1] + order[1] <= cur[1][1])
                    if (cur[0][2] + cur[2][2] + order[2] <= cur[1][2]) 
                        if (cur[0][3] + cur[2][3] + order[3] <= cur[1][3]) {
                            this.curId = (i + 1) % machine.length;
                            return i % machine.length;
                        }
        }
        return -1;
    }
}
function PMLB(container) {
    this.container = $(container);
}
PMLB.fn = PMLB.prototype = {
    getExpVector: function(m, o) {
        var n = m.length;
        var l = o.length;
        var res = [];
        for (var i = 0; i != n; i ++) {
            res[i] = [];
            for (var j = 0; j != l; j ++) {
                res[i][j] = o[j] / (m[i][1][j] - m[i][2][j] + 0.0);
            }
        }
        return res;
    },
    getWVector: function(o) {
        var c = [40.0, 8704.0, 2000, 17000.0];
        var t = [1 / Math.min(1.0, o[0]/c[0]), 1 / Math.min(1.0, o[1]/c[1]), 1 / Math.min(1.0, o[2]/c[2]), 1 / Math.min(1.0, o[3]/c[3])];
       // for (var i = 0; i != t.length; i ++) t[i] /= 1;
        var total = t[0] + t[1] + t[2] + t[3];
        return [t[0]/total,t[1]/total,t[2]/total,t[3]/total];
    },
    getQVector: function(p, e) {
        var n = p.length;
        var l = p[0].length;
        var res = [];
        for (var i = 0; i != n; i ++) {
            res[i] = [];
            for (var j = 0; j != l; j ++) 
                res[i][j] = p[i][j] - e[i][j];
        }
        return res;
    },
    getSVector: function(q, w) {
        var n = q.length;
        var l = w.length;
        var res = [], flag;
        for (var i = 0; i != n; i ++) {
            flag = 0;
            res[i] = 0;
            for (var j = 0; j != l; j ++) {
                if (q[i][j] < 0.0) {
                    flag = 1;
                    break;
                } else {
                    res[i] += q[i][j] * w[j];
                }
            }
            if (flag) res[i] = 'NaN';
        }
        return res;
    },


    getRVector: function(m) {
        return E.R;
    },
    getLoadVector: function(p, r, s) {
        var n = p.length;
        var l = r.length;
        var res = [];
        for (var i = 0; i != n; i ++) {
            if (s[i] == 'NaN'){
                res[i] = 'NaN';
                continue;
            } 
            res[i] = 0;
            for (var j = 0; j != l; j ++) 
                res[i] += p[i][j] * r[j];
        }
        return res;
    },

    getNextMachineIdx: function(machine, order) {
        var pv = E.getPerforVector(machine);
        var ev = this.getExpVector(machine, order);
        var wv = this.getWVector(order);
        var Qv = this.getQVector(pv, ev);
        var Sv = this.getSVector(Qv, wv);

        var aPV = E.getAvePerforVector(pv);
        var dPV = E.getDeltaPerforVector(pv, aPV);
        var rv = this.getRVector(machine);
        var Rv = this.getLoadVector(dPV, rv, Sv);
        var mx;
        var res = -1;
        var tmp;
        var n = 10, y = 10000;
        for (var i = 0, l = Rv.length; i != l; i ++) 
            if (Rv[i] != 'NaN') {
                tmp = Rv[i] * n / (Sv[i] * y);
		//tmp = Rv[i];
                if (tmp > mx || mx === undefined) {
                    mx = tmp;
                    res = i;
                }
            }
        return res;
    }
};
