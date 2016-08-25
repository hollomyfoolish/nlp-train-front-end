(function(){
    var IntentOperation = ['', 'cancel invoice', 'edit item', 'view item', 'create customer', 'view credit memo', 'view vendor', 'edit vendor', 'cancel credit memo', 'edit invoice', 'create invoice', 'view customer', 'create vendor', 'edit credit memo', 'edit customer', 'create credit memo', 'view invoice', 'internal reconcilation', 'create item'];
    var TOPICS = ['', 'Overdue Amount', 'Delayed Days', 'Profit', 'Revenue', 'Delayed', 'Sales Amount', 'Open Amount', 'Delayed Count', 'Customer Receivable Aging', 'Opportunity'];
    var GROUPBY = ['', 'None', 'Customer', 'Sales Employee', 'Contract', 'Project', 'Item', 'Product']
    var RETURN_TYPE = ['', 'Record', 'Numeric'];
    var SELECT_OPTIONS_TEMP = '<option value="{value}">{value}</option>';
    var ACTION_TAGS = [{
        id: 'Verb',
        name: 'Verb'
    },{
        id: 'TargetPrefix',
        name: 'Target Prefix'
    }, {
        id: 'Target',
        name: 'Target'
    }];
    var ACTION_OPTIONS = [{
        id: 'Direction',
        name: 'Direction'
    },{
        id: 'BPCustomer',
        name: 'BP Customer'
    }, {
        id: 'BPVendor',
        name: 'BP Vendor'
    }, {
        id: 'Item',
        name: 'Item'
    }];
    var QUESTION_SEGMENTS = [{
        id: 'Topic',
        name: 'Topic',
        values: TOPICS
    },{
        id: 'GroupBy',
        name: 'Group By',
        values: GROUPBY
    },{
        id: 'ReturnType',
        name: 'Return Type',
        values: RETURN_TYPE
    }, {
        id: 'LimitTag',
        name: 'Limit Tag',
        values: ['']
    }];
    var QUESTION_RADIOS = [{
        id: 'OrderBy',
        name: 'Order By',
        values: ['None', 'Desc', 'Asc']
    }];
    var QUESTION_OPTIONS = [{
        id: 'QBPCustomer',
        name: 'BP Customer'
    },{
        id: 'QBPVendor',
        name: 'BP Vendor'
    },{
        id: 'QItem',
        name: 'Item'
    },{
        id: 'QDateTime',
        name: 'Date Time'
    }];
    
    var template = function(temp){
        return {
            fill: function(data){
                data = Array.isArray(data)? data : [data];
                return data.map(d => temp.replace(/{(.+?)}/g, (m, g) => d[g] === ''?'' : d[g] || m));
            }
        };
    };
    var tagCheckHtml = template('<span class="tag-check predefined enabled" data-tag="{id}">{name}</span>')
    .fill(ACTION_TAGS)
    .concat(['<span class="tag-check customize"><input type="checkbox"> <input data-tag="customize" disabled></span>']).join('');
    var OPTION_TEMPLATE = '<div class="form-group"><div class="col-sm-offset-1 col-sm-10"><div class="checkbox"><label><input data-role="tagoption" type="checkbox" id="{id}">{name}</label></div></div></div>';
    var TAG_TEMPLATE = '<div class="form-group tag"><div class="col-sm-offset-1 col-sm-10"><span class="word">{name}</span>'+ tagCheckHtml +'</div></div>';
    var QUESTION_TEMPLATE = '<div class="form-group"><label for="{id}" class="col-sm-1 control-label">{name}</label><div class="col-sm-4"><select type="text" class="form-control" id="sel-{id}" placeholder="{name}">{options}</select></div></div>';

    var actionTab = {
        el: $('#actionForm'),
        createActionOptions: function(){
           return template(OPTION_TEMPLATE).fill(ACTION_OPTIONS).join('');
        },
        createTag: function(words){
            this.el.find('.tag').remove().end().append(template(TAG_TEMPLATE).fill(words.map(s => ({name: s}))).join(''));
        },
        addListeners: function(){
            this.el.find('#actionQ').on('input', e => this.createTag(e.target.value.trim() === ''?[] : e.target.value.trim().split(/\s+/)));
            this.el.delegate('.tag-check.customize>input[type="checkbox"]', 'click', e => e.target.checked?$(e.target).siblings('input').attr('disabled', false).end().parent().siblings('.tag-check').removeClass('enabled').addClass('disabled') : $(e.target).siblings('input').attr('disabled', true).end().parent().siblings('.tag-check').removeClass('disabled').addClass('enabled'));
            this.el.delegate('.tag-check.predefined', 'click', function(e){
                var tag = $(e.target);
                if(tag.hasClass('enabled')){
                    tag.addClass('tag-selected').siblings('.tag-check.predefined').removeClass('tag-selected');
                }
            });
            $('#actionSubmit').click(e => $.ajax('/SBONLP/sbonlp/nlp/trainAction', {
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({actionTrainingParam: this.collectData()})
            }).done(d => console.log(d)).fail((xhr, ts) => console.log(ts)));
        },
        collectData: function(){
            var customizeTagIdx = 1;
            var data = {
                IntentOperation: $('#actionA').val()
            };
            this.el.find('input[data-role="tagoption"]').each((idx, e) => e.checked?data[e.id] = 'y' : data[e.id] = '');
            this.el.find('.form-group.tag').each(function(idx, t){
                var $t = $(t),
                    $checkbox = $t.find('input[type="checkbox"]');
                if($checkbox[0].checked){
                    data['cus' + (customizeTagIdx++)] = $checkbox.siblings('input').val();
                }else{
                    data[$t.find('.tag-selected').data('tag')] = $t.find('.word').text();
                }
            });
            return data;
        },
        init: function(){
            this.el.find('label[for="actionA"]').siblings('.col-sm-8').append(template('<select id="{id}">{options}</select>').fill({id: 'actionSelect', options: template(SELECT_OPTIONS_TEMP).fill(IntentOperation.map(i => ({value: i})))})).children('select').combobox({
                id: 'actionA',
                placeholder: 'what should AI do'
            });
            this.el.append(this.createActionOptions());
            this.addListeners();
        }
    };

    var QUESTION_RADIO_TEMPLATE = '<div class="form-group"><label class="col-sm-1 control-label">{name}</label><div class="col-sm-8">{data}</div></div>';
    var QUESTION_RADIO_VALUES_TEMPLATE = '<label class="radio-inline"><input type="radio" name="{id}" value="{name}">{name}</label>';

    var questionTab = {
        el: $('#questionForm'),
        createQuestionOptions: function(){
            return template(OPTION_TEMPLATE).fill(QUESTION_OPTIONS)
            .concat(QUESTION_RADIOS.map(r => template(QUESTION_RADIO_TEMPLATE).fill(r)
                .map(rt => template(rt).fill({data: template(QUESTION_RADIO_VALUES_TEMPLATE).fill(r.values.map(v => ({id: r.id, name: v}))).join('')}))))
            .concat(template(QUESTION_TEMPLATE).fill(QUESTION_SEGMENTS.map(q => (q.options = template(SELECT_OPTIONS_TEMP).fill(q.values.map(x => ({value: x}))).join('')) && q)))
            .join('');
        },
        collectData: function(){
            var data = {
                RawQuestion: $('#questionQ').val()
            };
            QUESTION_OPTIONS.forEach(o => data[o.id] = this.el.find('#' + o.id)[0].checked? 'y' : '');
            QUESTION_RADIOS.forEach(r => data[r.id] = $('input[type="radio"][name="'+ r.id +'"]:checked').val() || '');
            QUESTION_SEGMENTS.forEach(s => data[s.id] = $('#' + s.id).val());
            return data;
        },
        addListeners: function(){
            $('#questionSubmit').click(e => $.ajax('/SBONLP/sbonlp/nlp/trainQuestion', {
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({questionTrainingParam: this.collectData()})
            }).done(d => console.log(d)).fail((xhr, ts) => console.log(ts)));
        },
        init: function(){
            this.el.append(this.createQuestionOptions()).find('select').each((i, s) => $(s).combobox({
                id: $(s).attr('id').replace('sel-', ''),
                placeholder: $(s).attr('placeholder')
            }));
            this.addListeners();
        }
    };

    var dialog = {
        el: $('#message'),
        message: function(msg){
            this.el.find('.modal-body').html(msg);
            return this;
        },
        show: function(){
            this.el.modal('show');
        }
    };

    var progressbar = {
        el: $('#main-mask'),
        start: function(){
            this.el.show();
            var p = this.el.find('.progress-bar');
            p.width(0);
            var loading = function(){
                var w = p.width();
                w = w > p.parent().width()? 0 : w;
                p.width(w + 2);
                this.t = setTimeout(loading, 30);
            }.bind(this);
            loading();
        },
        stop: function(){
            clearTimeout(this.t);
            this.el.find('.progress-bar').width(0).end().hide();
            return true;
        }
    };

    var trainerChecker = {
        check: function(){
            $.ajax('/SBONLP/sbonlp/nlp/checkTrainer', {
                method: 'GET',
                contentType: 'application/json'
            }).done(data => data.succeed?progressbar.stop() : this.check()).fail(err => progressbar.stop() && console.log(err));
        }
    };

    actionTab.init();
    questionTab.init();
    $('button.restart').click(e => $.ajax('/SBONLP/sbonlp/nlp/restartTrainer', {
        method: 'GET',
        contentType: 'application/json'
    }).done(rsp => progressbar.start()).fail(err => dialog.message('Restart failed').show() || console.log(err)));
    $('#trainTab a[href="#action"]').tab('show');
}())
