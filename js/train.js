(function(){
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
        name: 'Topic'
    },{
        id: 'GroupBy',
        name: 'Group By'
    },{
        id: 'ReturnType',
        name: 'Return Type'
    },{
        id: 'LimitTag',
        name: 'Limit Tag'
    }];
    var QUESTION_RADIOS = [{
        id: 'OrderBy',
        name: 'Order By',
        values: ['None', 'Desc', 'Asc']
    }];
    var QUESTION_OPTIONS = [{
        id: 'BPCustomer',
        name: 'BP Customer'
    },{
        id: 'BPVendor',
        name: 'BP Vendor'
    },{
        id: 'Item',
        name: 'Item'
    },{
        id: 'DateTime',
        name: 'Date Time'
    }];


    var template = function(temp){
        return {
            fill: function(data){
                data = Array.isArray(data)? data : [data];
                return data.map(d => temp.replace(/{(.+?)}/g, (m, g) => d[g]));
            }
        };
    };
    var tagCheckHtml = template('<span class="tag-check predefined enabled" data-tag="{id}">{name}</span>')
    .fill(ACTION_TAGS)
    .concat(['<span class="tag-check customize"><input type="checkbox"> <input data-tag="customize" disabled></span>']).join('');
    var OPTION_TEMPLATE = '<div class="form-group"><div class="col-sm-offset-1 col-sm-10"><div class="checkbox"><label><input data-role="tagoption" type="checkbox" id="{id}">{name}</label></div></div></div>';
    var TAG_TEMPLATE = '<div class="form-group tag"><div class="col-sm-offset-1 col-sm-10"><span class="word">{name}</span>'+ tagCheckHtml +'</div></div>';
    
    var actionTab = {
        el: $('#actionForm'),
        createActionOptions: function(){
           return template(OPTION_TEMPLATE).fill(ACTION_OPTIONS).join('');
        },
        createTag: function(words){
            this.el.find('.tag').remove().end().append(template(TAG_TEMPLATE).fill(words.map(s => ({name: s}))).join(''));
        },
        addListeners: function(){
            this.el.find('#actionQ').on('input', e => this.createTag(e.target.value.trim().split(/\s+/)));
            this.el.delegate('.tag-check.customize>input[type="checkbox"]', 'click', e => e.target.checked?$(e.target).siblings('input').attr('disabled', false).end().parent().siblings('.tag-check').removeClass('enabled').addClass('disabled') : $(e.target).siblings('input').attr('disabled', true).end().parent().siblings('.tag-check').removeClass('disabled').addClass('enabled'));
            this.el.delegate('.tag-check.predefined', 'click', function(e){
                var tag = $(e.target);
                if(tag.hasClass('enabled')){
                    tag.addClass('tag-selected').siblings('.tag-check.predefined').removeClass('tag-selected');
                }
            });
            $('#actionSubmit').click(e => console.log(this.collectData()));
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
            this.el.append(this.createActionOptions());
            this.addListeners();
        }
    };
    actionTab.init();
    $('#trainTab a[href="#action"]').tab('show');
}())
