(function() {
    'use strict';

    var Environment, Template, Loader, templatesPath, expect;

    if(typeof require !== 'undefined') {
        Environment = require('../src/environment').Environment;
        Template = require('../src/environment').Template;
        Loader = require('../src/node-loaders').FileSystemLoader;
        templatesPath = 'tests/templates';
        expect = require('expect.js');
    }
    else {
        Environment = nunjucks.Environment;
        Template = nunjucks.Template;
        Loader = nunjucks.WebLoader;
        templatesPath = '../templates';
        expect = window.expect;
    }

    var numAsyncs;
    var doneHandler;

    beforeEach(function() {
        numAsyncs = 0;
        doneHandler = null;
    });

    function equal(str, ctx, str2, env) {
        if(typeof ctx === 'string') {
            env = str2;
            str2 = ctx;
            ctx = null;
        }

        return render(str, ctx, {}, env).then(function (res) {

            expect(res).to.be(str2);

        });

    }

    function finish(done) {
        if(numAsyncs > 0) {
            doneHandler = done;
        }
        else {
            done();
        }
    }

    function normEOL(str) {
        if (!str) return str;
        return str.replace(/\r\n|\r/g, '\n');
    }

    function render(str, ctx, opts, env) {

        opts = opts || {};
        opts.dev = true;
        var e = env || new Environment(new Loader(templatesPath), opts);

        var name;
        if(opts.filters) {
            for(name in opts.filters) {
                e.addFilter(name, opts.filters[name]);
            }
        }

        if(opts.asyncFilters) {
            for(name in opts.asyncFilters) {
                e.addFilter(name, opts.asyncFilters[name], true);
            }
        }

        if(opts.extensions) {
            for(name in opts.extensions) {
                e.addExtension(name, opts.extensions[name]);
            }
        }

        ctx = ctx || {};
        var t = new Template(str, e);

        return t.render(ctx);
    }

    if(typeof module !== 'undefined') {
        module.exports.render = render;
        module.exports.equal = equal;
        module.exports.finish = finish;
        module.exports.normEOL = normEOL;
    }
    else {
        window.util = {
            render: render,
            equal: equal,
            finish: finish,
            normEOL: normEOL
        };
    }
})();
