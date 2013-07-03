/*!
 * lhgcore Dialog Plugin v4.0.0 bate2
 * Date : 2011-12-16 10:05:00
 * Copyright (c) 2009 - 2011 By Li Hui Gang
 * URL : http://lhgcore.com/
 * WBO : http://t.qq.com/lhgcore/
 */

;(function( $, window, undefined ){

$.noop = $.noop || function(){}; // jQuery 1.3.2
var _ie6 = window.VBArray && !window.XMLHttpRequest,
    _isIE = 'CollectGarbage' in window,
	_count = 0,
	_expando = 'lhgdialog' + (new Date).getTime(),
	_rurl = /^url:/, _box, onKeyDown,
		
/*!
 * ��¡������
 * @param	{Object}
 * @return  {Object} �˶���Ϊ��������Ϊԭ�Ͷ���Ŀն���
 */
_clone = function( object )
{
    function f(){};
	f.prototype = object;
	return new f;
},

/*!
 * _path ȡ������ļ�lhgdialog.js���ڵ�·��
 * _args ȡ�����ļ����url�����飬�磺lhgdialog.js?self=true&skin=aero�е�?���������
 */
_args, _path = (function( script, i, me )
{
    var l = script.length,
	    r = /lhgdialog(?:\.min)?\.js/i;
	
	for( ; i < l; i++ )
	{
	    if( r.test(script[i].src) )
		{
		    me = !!document.querySelector ?
			    script[i].src : script[i].getAttribute('src',4);
			break;
		}
	}
	
	me = me.split('?'); _args = me[1];
	
	return me[0].substr( 0, me[0].lastIndexOf('/') + 1 );
})(document.getElementsByTagName('script'),0),        

/*!
 * ��ȡurl����ֵ����
 * @param {String}
 * @return {String||null}
 * @demo lhgdialog.js?skin=aero | _getArgs('skin') => 'aero'
 */
_getArgs = function( name )
{
    if( _args )
	{
	    var p = _args.split('&'), i = 0, l = p.length, a;
		for( ; i < l; i++ )
		{
		    a = p[i].split('=');
			if( name === a[0] ) return a[1];
		}
	}
	return null;
},

/*! ȡƤ����ʽ����Ĭ��Ϊ default */
_skin = _getArgs('skin') || 'default',
color_template = _getArgs('t') || 'template_purple',

/*! ��ȡ lhgdialog �ɿ缶���õ���߲�� window ����� document ���� */
_doc, _top = (function(w)
{
	try{
	    _doc = w['top'].document;  // ����|��Ȩ��
		_doc.getElementsByTagName; // chrome ��������ذ�ȫ����
	}catch(e){
	    _doc = w.document; return w;
	}
	
	// ���ָ������selfΪtrue�򲻿��ܵ�������Ϊ��ܼ����޷���ʾ������Ԫ��
	if( _getArgs('self') === 'true' ||
	    _doc.getElementsByTagName('frameset').length > 0 )
	{
	    _doc = w.document; return w;
	}
	
	return w['top'];
})(window),

_$doc = $(_doc), _$top = $(_top), _$html = $('html',_doc);

/*! ����IE6 CSS����ͼƬ���� */
try{
	_doc.execCommand( 'BackgroundImageCache', false, true );
}catch(e){};

/*! �����ҳ�������ʽ�ļ� */
$('head',_doc).append( '<link href="' + _path + 'skins/' + _skin + '.css" rel="stylesheet" type="text/css"/>' );

$.fn.showIt = function(ib){
    ib = ib ? 'inline-block' : 'block';
	this[0].style.display = ib;
	return this;
};

$.fn.hideIt = function()
{
    this[0].style.display = 'none';
	return this;
};

/*!
 * lhgdialog ��ں���
 */
var lhgdialog = function( config, ok, cancel )
{
	config = config || {};
	
	if( typeof config === 'string' )
		config = { content: config };
	
	var api, setting = lhgdialog.setting;
		
	// �ϲ�Ĭ������
	for( var i in setting ){
		if( config[i] === undefined ) config[i] = setting[i];
	};
	
	config.id = config.id || _expando + _count;
	
	// ���������id�����򷵻ش��ڴ�id�Ĵ��ڶ���
	api = lhgdialog.list[config.id];
	if(api) return api.zindex().focus();
	
	// ��ť����
	if( !$.isArray(config.button) )
		config.button = config.button ? [config.button] : [];
	
	if( ok !== undefined ) config.ok = ok;
	if( cancel !== undefined ) config.cancel = cancel;
	
	config.ok && config.button.push({
	    name: config.okVal,
		callback: config.ok,
		focus: true
	});
	
	config.cancel && config.button.push({
	    name: config.cancelVal,
		callback: config.cancel
	});
	
	// zIndexȫ������
	lhgdialog.setting.zIndex = config.zIndex;
	
	_count++;
	
	return lhgdialog.list[config.id] = _box ?
	    _box._init(config) : _clone(lhgdialog.fn)._init( config );
};

lhgdialog.fn =
{
    version: '4.0.0',
	
	_init: function( config )
	{
	    var that = this, _url, DOM,
		    icon = config.icon,
			iconBg = icon && config.path + 'skins/icons/' + icon,
			
			// ��������ߵ�ͼ��
			ticon = config.titleIcon 
			? { backgroundImage: 'url(\'' + config.path + 'skins/icons/' + config.titleIcon + '\')', display:'' }
			: { display:'none' };
		
		// ������ʾ��ͼ��Ϊ��Ĭ�ϲ���ʾ��С������󻯰�ť
		if( icon )
		{
		    config.min = false;
			config.max = false;
		}
		
		that._isRun = true;
		that.config = config;
		that.DOM = DOM = that.DOM || that._getDOM();
		
		// ��������openerΪ����ǰ����ҳ���window����
		that.opener = window;
		
		DOM.wrap.addClass( config.skin ); // ��Ƥ������
		DOM.icon[0].style.display = icon ? '' : 'none';
		DOM.icon_bg.attr('src',iconBg || '');
		DOM.title_icon.css( ticon );
		DOM.rb[0].style.cursor = config.resize ? 'se-resize' : 'auto';
		DOM.title[0].style.cursor = config.drag ? 'move' : 'auto';
		DOM.max[config.max?'showIt':'hideIt'](true);
		DOM.min[config.min?'showIt':'hideIt'](true);
		DOM.close[config.cancel===false?'hideIt':'showIt'](true); //��cancel����Ϊfalseʱ���عرհ�ť
		DOM.content.css('padding', config.padding);
		
		that.show(true)
		.button(config.button)
		.title(config.title)
		.content(config.content, true)
		.size(config.width, config.height)
		.position(config.left, config.top)
		.zindex()
		.time(config.time);
		
		config.lock && that.lock();
		
		that._addEvent();
		that._ie6PngFix();
		
		_box = null;
		
		// ������ص��ǵ���ҳ�������ҳconfig.init������������ҳ������ɺ�ִ�У�����Ͳ�ִ����
		if( !_rurl.test(config.content) )
		{
		    config.init && config.init.call( that, window );
		}
		
		return that;
	},
	
	/*!
	 * ��������
	 * @param	{String}	���� (�������ǰ3���ַ�Ϊ��url:���ͼ��ص���ҳ�������ҳ)
	 * @return	{this}		����޲����򷵻ض�����
	 */
	content: function( msg )
	{
	    if( msg === undefined ) return this;
		
		var that = this, _url,
		    DOM = that.DOM,
			wrap = DOM.wrap[0],
			width = wrap.offsetWidth,
			height = wrap.offsetHeight,
			left = parseInt(wrap.style.left),
			top = parseInt(wrap.style.top),
			cssWidth = wrap.style.width,
			$content = DOM.content,
			loading = lhgdialog.setting.content;
		
		wrap.style.width = 'auto';
		
		if( typeof msg === 'string' )
		{
		    // ����������ǰ3���ַ�Ϊ'url:'�ͼ������·���ĵ���ҳ�������ҳ
			if( _rurl.test(msg) )
			{
				$content.html( loading );
				DOM.icon.hideIt();
				_url = msg.split('url:')[1];
				that._iframe( _url );
			}
			else
			    $content.html( msg );
		}
		
		// �������ݺ����λ��
		if( !arguments[1] )
		{
			width = wrap.offsetWidth - width;
			height = wrap.offsetHeight - height;
			left = left - width / 2;
			top = top - height / 2;
			wrap.style.left = Math.max(left, 0) + 'px';
			wrap.style.top = Math.max(top, 0) + 'px';
			
			if( cssWidth && cssWidth !== 'auto' )
				wrap.style.width = wrap.offsetWidth + 'px';
			
			that._autoPositionType();
		};
		
		that._ie6SelectFix();
		
		return that;
	},
	
	/**
	 * ���ñ���
	 * @param	{String, Boolean}	��������. Ϊfalse�����ر�����
	 * @return	{this}	����޲����򷵻ض�����
	 */
	title: function( text )
	{
		if( text === undefined ) return this;
		
		var DOM = this.DOM,
			border = DOM.border,
			title = DOM.title,
			className = 'ui_state_tips';
			
		if( text === false )
		{
			title.hideIt();
			DOM.title_txt.html('');
			border.addClass(className);
		}
		else
		{
			title.showIt();
			DOM.title_txt.html(text || '');
			border.removeClass(className);
		};
		
		return this;
	},
	
	/**
	 *	�ߴ�
	 *	@param	{Number, String}	���
	 *	@param	{Number, String}	�߶�
	 */
	size: function( width, height )
	{
		var maxWidth, maxHeight, scaleWidth, scaleHeight,
			that = this,
			config = that.config,
			DOM = that.DOM,
			wrap = DOM.wrap,
			main = DOM.main,
			wrapStyle = wrap[0].style,
			style = main[0].style;
		
		if( width )
		{
			that._width = width.toString().indexOf('%') !== -1 ? width : null;
			maxWidth = _$top.width() - wrap[0].offsetWidth + main[0].offsetWidth;
			scaleWidth = that._toNumber(width,maxWidth);
			width = scaleWidth;
			
			wrapStyle.width = 'auto';
			
			if( typeof width === 'number' )
				style.width = Math.max(that.config.minWidth,width) + 'px';
			else if( typeof width === 'string' )
				style.width = width;
			
			if( width !== 'auto' ) // ��ֹδ�����ȵı������������ұ߽߱�����
			    wrapStyle.width = wrap[0].offsetWidth + 'px';
		}
		
		if( height )
		{
			that._height = height.toString().indexOf('%') !== -1 ? height : null;
			maxHeight = _$top.height() - wrap[0].offsetHeight + main[0].offsetHeight;
			scaleHeight = that._toNumber(height,maxHeight);
			height = scaleHeight;
			
			if( typeof height === 'number' )
				style.height = Math.max(that.config.minHeight, height) + 'px';
			else if( typeof height === 'string' )
				style.height = height;
		};
		
		that._ie6SelectFix();
		
		return that;
	},
	
	/**
	 * λ��(����ڿ�������)
	 * @param	{Number, String}
	 * @param	{Number, String}
	 */
	position: function( left, top )
	{
		var that = this,
			config = that.config,
			wrap = that.DOM.wrap[0],
			isFixed = _ie6 ? false : config.fixed,
			ie6Fixed = _ie6 && config.fixed,
			docLeft = _$doc.scrollLeft(),
			docTop = _$doc.scrollTop(),
			dl = isFixed ? 0 : docLeft,
			dt = isFixed ? 0 : docTop,
			ww = _$top.width(),
			wh = _$top.height(),
			ow = wrap.offsetWidth,
			oh = wrap.offsetHeight,
			style = wrap.style;
		
		if( left || left === 0 )
		{
			that._left = left.toString().indexOf('%') !== -1 ? left : null;
			left = that._toNumber(left, ww - ow);
			
			if(typeof left === 'number')
			{
				left = ie6Fixed ? (left += docLeft) : left + dl;
				style.left = Math.max(left,dl) + 'px';
			}
			else if(typeof left === 'string')
				style.left = left;
		}
		
		if( top || top === 0 )
		{
			that._top = top.toString().indexOf('%') !== -1 ? top : null;
			top = that._toNumber(top, wh - oh);
			
			if(typeof top === 'number')
			{
				top = ie6Fixed ? (top += docTop) : top + dt;
				style.top = Math.max(top,dt) + 'px';
			}
			else if(typeof top === 'string')
				style.top = top;
		}
		
		if( left !== undefined && top !== undefined )
			that._autoPositionType();
		
		return that;
	},
	
	/**
	 * �Զ��尴ť
	 * @example
		button({
			name: 'login',
			callback: function () {},
			disabled: false,
			focus: true
		}, .., ..)
	 */
	button: function()
	{
		var that = this,
			ags = arguments,
			buttons = that.DOM.buttons[0],
			focusButton = 'ui_state_highlight',
			listeners = that._listeners = that._listeners || {},
			list = $.isArray(ags[0]) ? ags[0] : [].slice.call(ags);
		
		if( ags[0] === undefined ) return that;
		
		$.each(list, function(i,obj){
		    var name = obj.name,
			    isNewButton = !listeners[name],
				button = !isNewButton ?
					listeners[name].elem :
					_doc.createElement('input');
			
			if( !listeners[name] ) listeners[name] = {};
			if( obj.callback ) listeners[name].callback = obj.callback;
			if( obj.className ) button.className = obj.className;
			
			if( obj.focus )
			{
			    that._focus && that._focus.removeClass(focusButton);
				that._focus = $(button).addClass(focusButton);
				that.focus();
			}
			
			button[_expando + 'callback'] = name;
			button.disabled = !!obj.disabled;

			if( isNewButton )
			{
				button.type = 'button';
				button.value = name;
				listeners[name].elem = button;
				buttons.appendChild(button);
			}
		});
		
		buttons.style.display = list.length ? '' : 'none';
		that._ie6SelectFix();
		
		return that;
	},
	
	/*! ��ʾ�Ի��� */
	show: function()
	{
		this.DOM.wrap.showIt();
		!arguments[0] && this._lock && $('#lockMask',_doc).showIt();
		return this;
	},
	
	/*! ���ضԻ��� */
	hide: function()
	{
	    this.DOM.wrap.hideIt();
		!arguments[0] && this._lock && $('#lockMask',_doc).hideIt();
		return this;
	},
	
	/*! �رնԻ��� */
	close: function()
	{
		if( !this._isRun ) return this;
		
		var that = this,
			DOM = that.DOM,
			wrap = DOM.wrap,
			list = lhgdialog.list,
			fn = that.config.close;
		
		that.time();
		
		// ��ʹ��iframe��ʽ��������ҳʱ�Ĵ������
		if( that.iframe )
		{
			if( typeof  fn === 'function' && fn.call(that, that.iframe.contentWindow, window) === false )
			    return that;
			
			// ��Ҫ����Ҫ����iframe��ַ�������´γ��ֵĶԻ�����IE6��7�޷��۽�input
			// IEɾ��iframe��iframe��Ȼ�������ڴ��г����������⣬�û�src�������׽���ķ���
			$(that.iframe).css('display', 'none')
			.unbind('load', that._fmLoad)
			.attr('src','about:blank').remove();
			
			DOM.content.removeClass('ui_state_full');
			if( that._frmTimer ) clearTimeout(that._frmTimer);
		}
		else
		{
		    if( typeof fn === 'function' && fn.call(that, window) === false )
			    return that;
		}
		
		that.unlock();
		
		if( that._minState )
		    that._minReset();
		
		if( that._maxState )
		{
		    DOM.main.css({width:that._or.w,height:that._or.h});
		    DOM.res.hideIt();
			
			if( !that.parent || (that.parent && !that.parent._lock) )
			    _$html.removeClass('ui_lock_scroll ui_max_fixed');
		}
		
		// �ÿ�����
		wrap[0].className = wrap[0].style.cssText = '';
		DOM.outer.removeClass('ui_state_focus');
		DOM.title_txt.html('');
		DOM.content.html('');
		DOM.buttons.html('');
		
		if( lhgdialog.focus === that ) lhgdialog.focus = null;
		
		delete list[that.config.id];
		that._removeEvent();
		that.hide(true)._setAbsolute();
		
		// ��ճ�this.DOM֮����ʱ���󣬻ָ�����ʼ״̬���Ա�ʹ�õ���ģʽ
		for( var i in that )
		{
			if(that.hasOwnProperty(i) && i !== 'DOM') delete that[i];
		};
		
		// �Ƴ�HTMLElement������
		_box ? wrap.remove() : _box = that;
		
		return that;
	},
	
	/**
	 * ˢ�»���תָ��ҳ��
	 * @param	{Object, ָ��ҳ���window����}
	 * @param	{String, Ҫ��ת����ҳ���ַ}
	 */
	reload: function( win, url )
	{
	    win = win || window;
		
		try{
		    win.location.href = url ? url : win.location.href;
		}
		catch(e){ // ����
			url = this.iframe.src;
			$(this.iframe).attr('src', url);
		};
		
		return this;
	},
	
	/*!
	 * ��ʱ�ر�
	 * @param	{Number}	��λΪ��, �޲�����ֹͣ��ʱ��
	 * @param   {Function}  �رմ���ǰִ�еĻص�����
	 */
	time: function( second, callback )
	{
		var that = this,
			cancel = that.config.cancelVal,
			timer = that._timer;
			
		timer && clearTimeout(timer);
		if( callback ) callback.call(that);
		
		if(second)
		{
			that._timer = setTimeout(function(){
				that._click(cancel);
			}, 1000 * second);
		}
		
		return that;
	},
	
	/*! �ö��Ի��� */
	zindex: function()
	{
		var that = this,
			DOM = that.DOM,
			top = lhgdialog.focus,
			index = lhgdialog.setting.zIndex++;
		
		// ���õ��Ӹ߶�
		DOM.wrap.css('zIndex', index);
		
		// ������߲����ʽ
		top && top.DOM.outer.removeClass('ui_state_focus');
		lhgdialog.focus = that;
		DOM.outer.addClass('ui_state_focus');
		
		// ��չ�����ö����ܣ�ֻ����iframe��ʽ��������
		// ������������ҳʱ�㴰���������岿���ö�����
		if( that._$load && that._$load[0].style.zIndex )
		    that._$load.hideIt();
		if( top && top !== that && top.iframe )
		    top._$load.showIt();
		
		return that;
	},
	
	/*! ���ý��� */
	focus: function()
	{
	    try{
		    elemFocus = this._focus && this._focus[0] || this.DOM.close[0];
			elemFocus && elemFocus.focus();
		}catch(e){};
		
		return this;
	},
	
	/*!
	 * �������� 
	 * ���д��ڶ�����һ�����ֲ�
	 */
	lock: function()
	{
		var that = this, frm,
		    index = lhgdialog.setting.zIndex - 1,
			config = that.config,
			mask = $('#lockMask',_doc)[0] || null,
			style = mask ? mask.style : '',
			positionType = _ie6 ? 'absolute' : 'fixed';
		
		// ����������
		_$html.addClass('ui_lock_scroll');
		
		if( !mask )
		{
			frm = '<iframe src="about:blank" style="width:100%;height:100%;position:absolute;' +
			    'top:0;left:0;z-index:-1;filter:alpha(opacity=0)"></iframe>';
				
			mask = _doc.createElement('div');
			style = mask.style;
			mask.id = 'lockMask';
			
			style.cssText = 'position:' + positionType + ';left:0;top:0;width:100%;height:100%;overflow:hidden;';
			$(mask).css({ opacity:config.opacity, background:config.background });
			
			_doc.body.appendChild( mask );
			if( _ie6 ) mask.innerHTML = frm;
		}
		
		if( positionType === 'absolute' )
		{
		    style.width = _$top.width();
			style.height = _$top.height();
			style.top = _$doc.scrollTop();
			style.left = _$doc.scrollLeft();
		}
		
		// �ӳ���ʾ���ֲ㣬��ֹ��ʾ���ֲ�ʱ���Ͻ���С��������
		that._lockTimer = setTimeout(function(){
			style.display = '';
		    style.zIndex = index;
		}, 1);
		
		that.zindex();
		that.DOM.outer.addClass('ui_state_lock');
		
		that._lock = true;
			
		return that;
	},
	
	/*! �⿪���� */
	unlock: function()
	{
		var that = this,
		    config = that.config,
			mask = $('#lockMask',_doc)[0];
		
		if( mask && that._lock )
		{
		    // ���޼�����
			if( config.parent && config.parent._lock )
			{
			    var index = config.parent.DOM.wrap[0].style.zIndex;
				mask.style.zIndex = parseInt(index,10) - 1;
			}
			else
			{
			    mask.style.display = 'none';
			    _$html.removeClass('ui_lock_scroll');
			}
			
			that.DOM.outer.removeClass('ui_state_lock');
		}
		
		if( that._lockTimer ) clearTimeout(that._lockTimer);
		
		return that;
	},
	
	/*!
	 * ��󻯴���
	 */
	max: function()
	{
		if( !this.config.max ) return this;
		
		var that = this,
		    DOM = that.DOM,
			wrapStyle = DOM.wrap[0].style,
			mainStyle = DOM.main[0].style,
			rbStyle = DOM.rb[0].style,
			titleStyle = DOM.title[0].style,
			config = that.config,
		    top = _$doc.scrollTop(),
		    left = _$doc.scrollLeft();
		
		if( !that._maxState )
		{
		
			if( that._minState )
			{
			    that._minReset();
				DOM.min.showIt(true);
				that._minState = false;
			}
			
			// �洢��󻯴���ǰ��״̬
			that._or = {
				t: wrapStyle.top,
				l: wrapStyle.left,
				w: mainStyle.width,
				h: mainStyle.height,
				d: config.drag,
				r: config.resize,
				rc: rbStyle.cursor,
				tc: titleStyle.cursor
			};
			
			// ���ʱȥ��������
			!that._lock && _$html.addClass('ui_lock_scroll');
			_ie6 && _$html.addClass('ui_max_fixed');
			
			DOM.wrap.css({ top:top + 'px', left:left + 'px' });
			
			that.size('100%', '100%')._setAbsolute();
			config.drag = false;
			config.resize = false;
			rbStyle.cursor = 'auto';
			titleStyle.cursor = 'auto';
			
			DOM.max.hideIt();
			DOM.res.showIt(true);
			
			that._maxState = true;
		}
		else
		{
		    !that._lock && _$html.removeClass('ui_lock_scroll');
			
			if( _ie6 )
			{
			    _$html.removeClass('ui_max_fixed');
				that._top = that._or.t;
				that._left = that._or.l;
			}
			
			DOM.wrap.css({ top:that._or.t, left:that._or.l });
			that.size(that._or.w, that._or.h)._autoPositionType();
			config.drag = that._or.d;
		    config.resize = that._or.r;
		    rbStyle.cursor = that._or.rc;
		    titleStyle.cursor = that._or.tc;
		
		    DOM.res.hideIt();
			DOM.max.showIt(true);
			
			delete that._or;
			
			// IE6 ����ʹ��iframe��ʽ��������ҳ��򿪴��ں�������ٻ�ԭ�ͻ᲻��ʾ�ײ�
		    // ��ť���İ�ť��ֻ�н���һ��������Ĳ����Ż�û�£���֪Ϊ�Σ�
			if( _ie6 && that.iframe )
				DOM.outer.addClass('ui_button_bug').removeClass('ui_button_bug');
			
			that._maxState = false;
		}
		
		return that;
	},
	
	/*!
	 * ��С������
	 */
	min: function()
	{
	    if( !this.config.min ) return this;
		
		var that = this,
		    DOM = that.DOM;
			
		if( !that._minState )
		{
		    if( that._maxState )
				that.max();
			
			that._minRz = that.config.resize;
			DOM.main.hideIt();
		    DOM.footer.hideIt();
		    DOM.dialog[0].style.width = DOM.main[0].style.width;
			DOM.rese.showIt(true);
			DOM.min.hideIt();
			DOM.rb[0].style.cursor = 'auto';
			that.config.resize = false;
		
		    that._minState = true;
		}
		else
		{
		    that._minReset();
			DOM.min.showIt(true);
			
			delete that._minRz;
			
			that._minState = false;
		}
		
		return that;
	},
	
	/*!
	 * ��ȡָ��id�Ĵ��ڶ���򴰿���iframe���ص�����ҳ��window����
	 * @param {String} ָ����id
	 * @param {String} �Ƿ񷵻ص�Ϊָ��id�Ĵ��ڶ���
	 *        ������1����ʾ�棬�����д��д����Ϊfalse
	 * @return {Object|null}
	 */
	get: function( id, object )
	{
		if( lhgdialog.list[id] )
		{
			if( object === 1 )
			    return lhgdialog.list[id];
			else
			    return lhgdialog.list[id].iwin || null;
		}
		
		return null;
	},
	
	/*!
	 * ����iframe��ʽ��������ҳ
	 */
	_iframe: function( url )
	{
	    var that = this, $iframe, iwin, $idoc, ibody, iWidth, iHeight,
		    $content = that.DOM.content,
			config = that.config,
			$loading = that._$load = $('.ui_loading',$content[0]),
		    initCss = 'position:absolute;left:-9999em;border:none 0;background:transparent',
		    loadCss = 'width:100%;height:100%;border:none 0;';
		
		// �Ƿ�������. Ĭ��true
		if( config.cache === false )
		{
			var ts = (new Date).getTime(),
				ret = url.replace(/([?&])_=[^&]*/, '$1_=' + ts );
			url = ret + ((ret === url) ? (/\?/.test(url) ? '&' : '?') + '_=' + ts : '');
		}
		
		$iframe = $('<iframe name="' + config.id + '" frameborder="0" src="" ' +
		    'allowtransparency="true" style="' + initCss + '"><\/iframe>',_doc);
		
		that.iframe = $iframe[0];
		$content[0].appendChild( $iframe[0] );
		
		// �ӳټ���iframe��src���ԣ�IE6�²��ӳټ��ػ���ּ��ؽ�������BUG
		that._frmTimer = setTimeout(function(){
		    $iframe.attr('src', url);
		}, 1);
		
		// iframe��ҳ�������ɺ�ִ�еĺ���
		var load = that._fmLoad = function()
		{
			$content.addClass('ui_state_full');
			
			// ��ǿ�����ö����ܣ�iframe��ʽ�������ݻ�����������ҳʱ�㴰�����ݲ����ö�����
			// ͨ��ʹ������loading�������ŵ���ɴ˹��ܣ���focus�������д˹��ܵ���ش���
			var title = that.DOM.title[0],
			    lt = that.DOM.lt[0],
				mainStyle = that.DOM.main[0].style;
				
			$loading[0].style.cssText = 'display:none;z-index:1;position:absolute;background:#FFF;top:' + 
			    (title.offsetHeight + lt.offsetHeight + 2) + 'px;width:' + mainStyle.width + ';height:' + mainStyle.height + ';';
			$loading.css('opacity',0).html('');
			// �˲��ִ�����������϶��ı��С��_dragEvent.onmove�����л��д˹��ܵ���ش���
			
			try{
			    iwin = that.iwin = $iframe[0].contentWindow; // ���崰�ڶ���iwin����Ϊ����ҳ��window����
				$idoc = $(iwin.document);
				ibody = iwin.document.body;
			}catch(e){// ����
			    $iframe[0].style.cssText = loadCss;
				return;
			}
			// ��ȡiframe�ڲ��ߴ�
			iWidth = config.width === 'auto'
			? $idoc.width() + (_ie6 ? 0 : parseInt($(ibody).css('marginLeft')))
			: config.width;
			
			iHeight = config.height === 'auto'
			? $idoc.height() : config.height;
			
			// ��Ӧiframe�ߴ�
			setTimeout(function(){
			    $iframe[0].style.cssText = loadCss;
			},0);// setTimeout: ��ֹIE6~7�Ի�����ʽ��Ⱦ�쳣
		
			if( !that._maxState )
			{
			    that.size( iWidth, iHeight )
			    .position( config.left, config.top );
			}
			
			// �ǿ���ʱ��Ҫ��loading�������С��Ҫ����Ͷȶ�Ϊ'auto'
			$loading.css({width:mainStyle.width, height:mainStyle.height});
			
			config.init && config.init.call( that, iwin, _top );
		};
		
		// ��iframeԪ��api����Ϊ�����������������ҳ�д����Ժ���Ҫ
		that.iframe.api = that;
		$iframe.bind( 'load', load );
	},
	
	/*! ��ȡ����Ԫ�� */
	_getDOM: function()
	{
		var wrap = $(lhgdialog.templates,_doc).prependTo(_doc.body),
            name, i = 0,
			DOM = { wrap: wrap },
			els = wrap[0].getElementsByTagName('*'),
			len = els.length;
			
		for( ; i < len; i ++ )
		{
			name = els[i].className.split('ui_')[1];
			if(name) DOM[name] = $(els[i]);
		};
		
		return DOM;
	},
	
	/*!
	 * px��%��λת������ֵ (�ٷֱȵ�λ�������ֵ����)
	 * �����ĵ�λ����ԭֵ
	 */
	_toNumber: function( thisValue, maxValue )
	{
		if( !thisValue && thisValue !== 0 || typeof thisValue === 'number')
			return thisValue;
		
		var last = thisValue.length - 1;
		if( thisValue.lastIndexOf('px') === last )
			thisValue = parseInt(thisValue);
		else if( thisValue.lastIndexOf('%') === last )
			thisValue = parseInt(maxValue * thisValue.split('%')[0] / 100);
		
		return thisValue;
	},
	
	/*! ��IE6 CSS֧��PNG���� */
	_ie6PngFix: _ie6 ? function(){
		var i = 0, elem, png, pngPath, runtimeStyle,
			path = lhgdialog.setting.path + '/skins/',
			list = this.DOM.wrap[0].getElementsByTagName('*');
		
		for( ; i < list.length; i ++ )
		{
			elem = list[i];
			png = elem.currentStyle['png'];
			if( png )
			{
				pngPath = path + png;
				runtimeStyle = elem.runtimeStyle;
				runtimeStyle.backgroundImage = 'none';
				runtimeStyle.filter = "progid:DXImageTransform.Microsoft." +
					"AlphaImageLoader(src='" + pngPath + "',sizingMethod='scale')";
			};
		}
	} : $.noop,
	
	/*! ǿ�Ƹ���IE6�����ؼ� */
	_ie6SelectFix: _ie6 ? function(){
		var $wrap = this.DOM.wrap,
			wrap = $wrap[0],
			expando = _expando + 'iframeMask',
			iframe = $wrap[expando],
			width = wrap.offsetWidth,
			height = wrap.offsetHeight;

		width = width + 'px';
		height = height + 'px';
		if(iframe)
		{
			iframe.style.width = width;
			iframe.style.height = height;
		}else{
			iframe = wrap.appendChild(_doc.createElement('iframe'));
			$wrap[expando] = iframe;
			iframe.src = 'about:blank';
			iframe.style.cssText = 'position:absolute;z-index:-1;left:0;top:0;'
			+ 'filter:alpha(opacity=0);width:' + width + ';height:' + height;
		}
	} : $.noop,
	
	/*! �Զ��л���λ���� */
	_autoPositionType: function()
	{
		this[this.config.fixed ? '_setFixed' : '_setAbsolute']();
	},
	
	/*! ���þ�ֹ��λ
	 * IE6 Fixed @see: http://www.planeart.cn/?p=877
	 */
	_setFixed: (function()
	{
	    _ie6 && $(function(){
		    var bg = 'backgroundAttachment';
			if( _$html.css(bg) !== 'fixed' && $(_doc.body).css(bg) !== 'fixed' )
			{
			    _$html.css({
				    zoom: 1,// ����ż������body����ͼƬ�쳣�����
					backgroundImage: 'url(about:blank)',
					backgroundAttachment: 'fixed'
				});
			}
		});
		
		return function(){
			var $elem = this.DOM.wrap,
				style = $elem[0].style;
			
			if(_ie6)
			{
				var sLeft = _$doc.scrollLeft(),
					sTop = _$doc.scrollTop(),
					left = parseInt($elem.css('left')) - sLeft,
					top = parseInt($elem.css('top')) - sTop;
				
				this._setAbsolute();
				
				style.setExpression( 'left', 'this.ownerDocument.documentElement.scrollLeft +' + left );
				style.setExpression( 'top', 'this.ownerDocument.documentElement.scrollTop +' + top );
			}
			else
				style.position = 'fixed';
		};
	}()),
	
	/*! ���þ��Զ�λ */
	_setAbsolute: function()
	{
		var style = this.DOM.wrap[0].style;
			
		if(_ie6)
		{
			style.removeExpression('left');
			style.removeExpression('top');
		}

		style.position = 'absolute';
	},
	
	/*! �С��ԭʱ���� */
	_minReset: function()
	{
	    var that = this,
		    DOM = that.DOM;
			
		DOM.main[0].style.display = '';
		DOM.footer[0].style.display = '';
		DOM.dialog.removeAttr('style');
		DOM.rese.hideIt();
		that.config.resize = that._minRz;
		DOM.rb[0].style.cursor = that._minRz ? 'se-resize' : 'auto';
	},
	
	/*! ��ť�ص��������� */
	_click: function( name )
	{ 
		var that = this,
			fn = that._listeners[name] && that._listeners[name].callback;
		return typeof fn !== 'function' || fn.call(that, window) !== false ?
			that.close() : that;
	},
	
	/*! ����λ����ߴ� */
	_reset: function( test )
	{
		var newSize,
			that = this,
			tw = _$top.width(),
			tt = _$top.height(),
			oldSize = that._winSize || tw * tt,
			oldWidth = that._lockDocW || tw,
			width = that._width,
			height = that._height,
			left = that._left,
			top = that._top;
		
		if(test)
		{
			//IE6�����ִ�С�ı�
			if( that._lock && _ie6 )
			    $('#lockMask',_doc).css({ width:tw + 'px', height:tt + 'px' });
			
			newWidth = that._lockDocW = tw;
			//IE6~7 window.onresize bug
			newSize = that._winSize =  tw * tt;
			if( oldSize === newSize ) return;
		};
		
		if(width || height) that.size(width, height);
		
		//IE9���µ�IE���ڹر�����ʱʹ֮ǰ�򿪵Ĵ��ڻص�ԭλ��BUG 
		if( test && Math.abs(oldWidth - newWidth) === 17 ) return;
		
		if(left || top)
			that.position(left, top);
	},
	
	/*! �¼����� */
	_addEvent: function()
	{
		var resizeTimer,
			that = this,
			config = that.config,
			DOM = that.DOM;
		
		// ���ڵ����¼�
		that._winResize = function()
		{
			resizeTimer && clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function()
			{
				that._reset(_isIE);
			}, 140);
		};
		_$top.bind('resize', that._winResize);
		
		// �������
		DOM.wrap.bind('click',function(event)
		{
			var target = event.target, callbackID;
			
			if( target.disabled ) return false; // IE BUG
			
			if( target === DOM.close[0] )
			{
				that._click(config.cancelVal);
				return false;
			}
			else if( target === DOM.max[0] || target === DOM.res[0] || target === DOM.max_b[0]
			    || target === DOM.res_b[0] || target === DOM.res_t[0] )
			{
			    that.max();
				return false;
			}
			else if( target === DOM.min[0] || target === DOM.rese[0] || target === DOM.min_b[0]
			    || target === DOM.rese_b[0] || target === DOM.rese_t[0] )
			{
				that.min();
				return false;
			}
			else
			{
				callbackID = target[_expando + 'callback'];
				callbackID && that._click(callbackID);
			};
			
			that._ie6SelectFix();
		}).bind('mousedown',function(event)
		{
		    that.zindex();
			
			var target = event.target,
			    title = DOM.title[0],
				icon = DOM.title_icon[0],
				txt = DOM.title_txt[0];
			
			if( config.drag !== false && (target === title || target === icon || target === txt)
			|| config.resize !== false && target === DOM.rb[0] )
			{
			    _dragEvent = _dragEvent || new lhgdialog.dragEvent();
				_use(event);
				return false; // ��ֹfirefox��chrome����
			}
		});
		
		// ˫����������󻯻������¼�
		if( config.max )
		    DOM.title.bind('dblclick',function(){ that.max();return false; });
	},
	
	/*!  ж���¼����� */
	_removeEvent: function()
	{
		var that = this,
			DOM = that.DOM;
		
		DOM.wrap.unbind();
		DOM.title.unbind();
		_$top.unbind('resize', that._winResize);
	}
};

/*! ʹ��jQ��ʽ���ô��� */
$.fn.dialog = $.fn.lhgdialog = function()
{
	var config = arguments;
	this.bind('click', function(){
		lhgdialog.apply(this, config);
		return false;
	});
	return this;
};

/*! �˶��������洢��ý���Ĵ��ڶ���ʵ�� */
lhgdialog.focus = null;

/*! ��߲�� window ���� */
lhgdialog.top = _top;

/*! �洢����ʵ���Ķ����б� */
lhgdialog.list = {};

/*!
 * ȫ�ֿ�ݼ�
 * ���ڿ���ʱ�¼��ǰ󶨵����ҳ�棬���Ե���ǰҳ��ж��ʱ����Ҫ���ƴ��¼�
 * ���Ա���unbind���¼��󶨵ĺ�������������Ҫ���󶨵��¼����������
 * �����ڵ�ǰҳ��ж��ʱ�Ϳ����ƴ��¼��󶨵���Ӧ������������Ӱ�춥��ҳ����¼��󶨵���������
 */
onKeyDown = function(event)
{
	var target = event.target,
		nodeName = target.nodeName,
		rinput = /^INPUT|TEXTAREA$/,
		api = lhgdialog.focus,
		keyCode = event.keyCode;

	if( !api || !api.config.esc || rinput.test(nodeName) ) return;
		
	keyCode === 27 && api._click(api.config.cancelVal);
};

_$doc.bind('keydown',onKeyDown);

/*! 
 * ҳ��DOM�������ִ�еĴ���
 */
$(function()
{
	// ���������Ԥ�Ȼ��汳��ͼƬ
	setTimeout(function()
	{
	    if(_count) return;
		lhgdialog({left:'-9999em',time:9,fixed:false,lock:false});
	},150);
	
	// ��ǿlhgdialog��ק���飨��ѡ����ģ�飬�粻��Ҫ��ɾ����
	// ��ֹ�������iframe���²��������Գ���Ի����϶��Ż�
	if( lhgdialog.setting.extendDrag ) //lhgdialog.setting.extendDrag ��Ĭ��ѡ��ֻ��ʹ��ȫ������
	{
		var event = lhgdialog.dragEvent;
		if( !event ) return;
		
		var dragEvent = event.prototype,
			mask = _doc.createElement('div'),
			style = mask.style,
			positionType = _ie6 ? 'absolute' : 'fixed';
		
		style.cssText = 'display:none;position:' + positionType + ';left:0;top:0;width:100%;height:100%;'
		+ 'cursor:move;filter:alpha(opacity=0);opacity:0;background:#FFF;pointer-events:none;';
		
		mask.id = 'dragMask';
		_doc.body.appendChild(mask);
		
		dragEvent._start = dragEvent.start;
		dragEvent._end = dragEvent.end;
		
		dragEvent.start = function()
		{
			var api = lhgdialog.focus,
				main = api.DOM.main[0],
				iframe = api.iframe;
			
			dragEvent._start.apply(this, arguments);
			style.display = 'block';
			style.zIndex = lhgdialog.setting.zIndex + 3;
			
			if(positionType === 'absolute')
			{
				style.width = '100%';
				style.height = _$top.height() + 'px';
				style.left = _$doc.scrollLeft() + 'px';
				style.top = _$doc.scrollTop() + 'px';
			};
			
			if( iframe && main.offsetWidth * main.offsetHeight > 307200 )
				main.style.visibility = 'hidden';
		};
		
		dragEvent.end = function()
		{
			var api = lhgdialog.focus;
			dragEvent._end.apply(this, arguments);
			style.display = 'none';
			if(api) api.DOM.main[0].style.visibility = 'visible';
		};
	}
});

/*!
 * ���ҳ��ж��ǰ�ر����д�Խ�ĶԻ���
 * ͬʱ�Ƴ��϶�������ֲ�
 */
_top != window && $(window).bind('unload',function()
{
    var list = lhgdialog.list;
	for( var i in list )
	{
	    if(list[i])
		    list[i].close();
	}
	_box && _box.DOM.wrap.remove();
	
	_$doc.unbind('keydown',onKeyDown);
	// ɾ�����ݹ���洢�������������ͷ��ڴ�
	delete lhgdialog[_expando + '_data'];
	
	$('#lockMask',_doc)[0] && $('#lockMask',_doc).remove();
	$('#dragMask',_doc)[0] && $('#dragMask',_doc).remove();
});

/**
 * �������ݹ���ӿ�
 * @see		http://www.planeart.cn/?p=1554
 * @param	{String}	�洢��������
 * @param	{Any}		��Ҫ�洢����������(�޴����򷵻ر���ѯ������)
 */
lhgdialog[_expando + '_data'] = {};

lhgdialog.data = function( name, value )
{
    var cache = lhgdialog[_expando+'_data'];
	
	if( value !== undefined )
	    cache[name] = value;
	else
	    return cache[name];
	
	return cache;
};

/**
 * ���ݹ���ɾ���ӿ�
 * @param	{String}	ɾ����������
 */
lhgdialog.removeDate = function( name )
{
    var cache = lhgdialog[_expando+'_data'];
	if( cache && cache[name] ) delete cache[name];
};

/*!
 *------------------------------------------------
 * �Ի���ģ��-��ק֧�֣���ѡ����ģ�飩
 *------------------------------------------------
 */
var _dragEvent, _use,
    _elem = _doc.documentElement,
	_isSetCapture = 'setCapture' in _elem,
	_isLosecapture = 'onlosecapture' in _elem;

lhgdialog.dragEvent = function()
{
    var that = this,
	
	proxy = function(name)
	{
	    var fn = that[name];
		that[name] = function(){
		    return fn.apply(that,arguments);
		}
	};
	
	proxy('start');
	proxy('move');
	proxy('end');
};

lhgdialog.dragEvent.prototype =
{
	// ��ʼ��ק
	onstart: $.noop,
	start: function(event)
	{
		var that = this;
		
		_$doc
		.bind( 'mousemove', that.move )
		.bind( 'mouseup', that.end );
		
		that._sClientX = event.clientX;
		that._sClientY = event.clientY;
		that.onstart( event.clientX, event.clientY );
		
		return false;
	},
	
	// ������ק
	onmove: $.noop,
	move: function(event)
	{		
		var that = this;
		
		that._mClientX = event.clientX;
		that._mClientY = event.clientY;
		
		that.onmove(
			event.clientX - that._sClientX,
			event.clientY - that._sClientY
		);
		
		return false;
	},
	
	// ������ק
	onend: $.noop,
	end: function(event)
	{
		var that = this;
		
		_$doc
		.unbind('mousemove', that.move)
		.unbind('mouseup', that.end);
		
		that.onend( event.clientX, event.clientY );
		return false;
	}
};

_use = function(event)
{
	var limit, startWidth, startHeight, startLeft, startTop, isResize,
		api = lhgdialog.focus,
		config = api.config,
		DOM = api.DOM,
		wrap = DOM.wrap,
		title = DOM.title,
		main = DOM.main,
	
	// ����ı�ѡ��
	clsSelect = 'getSelection' in _$top[0] ?
	function(){
		_$top[0].getSelection().removeAllRanges();
	}:function(){
		try{_$doc[0].selection.empty();}catch(e){};
	};
	
	// �Ի���׼���϶�
	_dragEvent.onstart = function( x, y )
	{
		if( isResize )
		{
			startWidth = main[0].offsetWidth;
			startHeight = main[0].offsetHeight;
		}
		else
		{
			startLeft = wrap[0].offsetLeft;
			startTop = wrap[0].offsetTop;
		};
		
		_$doc.bind( 'dblclick', _dragEvent.end );
		
		!_ie6 && _isLosecapture
		? title.bind('losecapture',_dragEvent.end )
		: _$top.bind('blur',_dragEvent.end);
		
		_isSetCapture && title[0].setCapture();
		
		DOM.outer.addClass('ui_state_drag');
	};
	
	// �Ի����϶�������
	_dragEvent.onmove = function( x, y )
	{
		if( isResize )
		{
			var wrapStyle = wrap[0].style,
				style = main[0].style,
				width = x + startWidth,
				height = y + startHeight;
			
			wrapStyle.width = 'auto';
			config.width = style.width = Math.max(0,width) + 'px';
			wrapStyle.width = wrap[0].offsetWidth + 'px';
			
			config.height = style.height = Math.max(0,height) + 'px';
		    // ʹ��loading���ö�����ʱ���ڴ�С�ı���Ӧloading���СҲ�øı�
			api._$load && api._$load.css({width:style.width, height:style.height});
		}
		else
		{
			var style = wrap[0].style,
				left = x + startLeft,
				top = y + startTop;

			config.left = Math.max( limit.minX, Math.min(limit.maxX,left) );
			config.top = Math.max( limit.minY, Math.min(limit.maxY,top) );
			style.left = config.left + 'px';
			style.top = config.top + 'px';
		}
			
		clsSelect();
		api._ie6SelectFix();
	};
	
	// �Ի����϶�����
	_dragEvent.onend = function( x, y )
	{
		_$doc.unbind('dblclick',_dragEvent.end);
		
		!_ie6 && _isLosecapture
		? title.unbind('losecapture',_dragEvent.end)
		: _$top.unbind('blur',_dragEvent.end);
		
		_isSetCapture && title[0].releaseCapture();
		
		_ie6 && api._autoPositionType();
		
		DOM.outer.removeClass('ui_state_drag');
	};
	
	isResize = event.target === DOM.rb[0] ? true : false;
	
	limit = (function()
	{
		var maxX, maxY,
			wrap = api.DOM.wrap[0],
			fixed = wrap.style.position === 'fixed',
			ow = wrap.offsetWidth,
			// �����϶�ʱ���ܽ��������ϳ���������
			oh = title[0].offsetHeight + DOM.lt[0].offsetHeight || 20,
			ww = _$top.width(),
			wh = _$top.height(),
			dl = fixed ? 0 : _$doc.scrollLeft(),
			dt = fixed ? 0 : _$doc.scrollTop();
		// �������ֵ����(�ڿ���������)	
		maxX = ww - ow + dl;
		maxY = wh - oh + dt;
		
		return {
			minX: dl,
			minY: dt,
			maxX: maxX,
			maxY: maxY
		};
	})();
	
	_dragEvent.start(event);
};

/*!
 * �������ģ�壬����Ƥ������Ӧ�Ź���ṹ
 * ������[һ˿����] �����ṩ QQ:50167214
 */
lhgdialog.templates =
'<div style="position:absolute;left:0;top:0">' +
'<div class="ui_outer">' +
    '<table class="ui_border">' +
	    '<tbody class="'+color_template+'">' +
		    '<tr>' +
			    '<td class="ui_lt"></td>' +
				'<td class="ui_t"></td>' +
				'<td class="ui_rt"></td>' +
			'</tr>' +
			'<tr>' +
				'<td class="ui_l"></td>' +
				'<td class="ui_c">' +
				    '<div class="ui_inner">' +
					'<table class="ui_dialog">' +
						'<tbody>' +
							'<tr>' +
								'<td colspan="2" class="ui_header">' +
									'<div class="ui_title_bar">' +
										'<div class="ui_title" unselectable="on"><span class="ui_title_icon"></span><b class="ui_title_txt" unselectable="on"></b></div>' +
										'<div class="ui_title_buttons">' +
											'<a class="ui_min" href="javascript:void(0)" title="\u6700\u5C0F\u5316"><b class="ui_min_b"></b></a>' +
											'<a class="ui_rese" href="javascript:void(0)" title="\u6062\u590D"><b class="ui_rese_b"></b><b class="ui_rese_t"></b></a>' +
											'<a class="ui_max" href="javascript:void(0)" title="\u6700\u5927\u5316"><b class="ui_max_b"></b></a>' +
											'<a class="ui_res" href="javascript:void(0)" title="\u8FD8\u539F"><b class="ui_res_b"></b><b class="ui_res_t"></b></a>' +
										    '<a class="ui_close" href="javascript:void(0)" title="\u5173\u95ED(esc\u952E)">\xd7</a>' +
										'</div>' +
									'</div>' +
								'</td>' +
							'</tr>' +
							'<tr>' +
								'<td class="ui_icon">' +
									'<img src="" class="ui_icon_bg"/>' + 
								'</td>' +
								'<td class="ui_main">' +
									'<div class="ui_content"></div>' +
								'</td>' +
							'</tr>' +
							'<tr>' +
								'<td colspan="2" class="ui_footer">' +
									'<div class="ui_buttons"></div>' +
								'</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'</div>' +
				'</td>' +
				'<td class="ui_r"></td>' +
			'</tr>' +
			'<tr>' +
				'<td class="ui_lb"></td>' +
				'<td class="ui_b"></td>' +
				'<td class="ui_rb"></td>' +
			'</tr>' +
		'</tbody>' +
	'</table>' +
'</div>' +
'</div>';

/*! lhgdialog ��ȫ��Ĭ������ */
lhgdialog.setting =
{
    content: '<div class="ui_loading"><span>loading...</span></div>',
	title: '\u89C6\u7A97 ',     // ����. Ĭ��'�Ӵ�'
	titleIcon: null,            // ��������ߵ�Сͼ��
	button: null,				// �Զ��尴ť
	ok: null,					// ȷ����ť�ص�����
	cancel: null,				// ȡ����ť�ص�����
	init: null,					// �Ի����ʼ����ִ�еĺ���
	close: null,				// �Ի���ر�ǰִ�еĺ���
	okVal: '\u786E\u5B9A',		// ȷ����ť�ı�. Ĭ��'ȷ��'
	cancelVal: '\u53D6\u6D88',	// ȡ����ť�ı�. Ĭ��'ȡ��'
	skin: '',					// ��Ƥ������Ԥ���ӿ�
	esc: true,					// �Ƿ�֧��Esc���ر�
	width: 'auto',				// ���ݿ��
	height: 'auto',				// ���ݸ߶�
	minWidth: 350,				// ��С�������
	minHeight: 32,				// ��С�߶�����
	icon: null,					// ��Ϣͼ������
	path: _path,                // lhgdialog·��
	lock: true,				// �Ƿ�����
	parent: null,               // ���Ӵ��ڵĸ����ڶ�����Ҫ���ڶ����������
	background: '#ccc',		// ������ɫ
	opacity: .3,				// ����͸����
	padding: '20px 20px 10px',		    // ������߽�������
	fixed: false,				// �Ƿ�ֹ��λ
	left: '50%',				// X������
	top: '38.2%',				// Y������
	max: false,                  // �Ƿ���ʾ��󻯰�ť
	min: false,                  // �Ƿ���ʾ��С����ť
	zIndex: 1976,				// �Ի�����Ӹ߶�ֵ(��Ҫ����ֵ���ܳ���������������)
	resize: false,				// �Ƿ������û����ڳߴ�
	drag: true, 				// �Ƿ������û��϶�λ��
	cache: true,                // �Ƿ񻺴洰������ҳ
	extendDrag: false           // ����lhgdialog��ק����
};

window.lhgdialog = $.dialog = $.lhgdialog = lhgdialog;

})( this.jQuery||this.lhgcore, this );

/*!
 *------------------------------------------------
 * �Ի�������������չģ�飨��ѡ����ģ�飩
 *------------------------------------------------
 */
;(function( $, lhgdialog, undefined ){

var _zIndex = function()
{
    return lhgdialog.setting.zIndex;
};

/**
 * ����
 * @param	{String}	��Ϣ����
 */
lhgdialog.alert = function( content, callback )
{
	return lhgdialog({
		title: '����',
		id: 'Alert',
		zIndex: _zIndex(),
		icon: 'alert.gif',
		fixed: true,
		lock: true,
		content: content,
		ok: true,
		resize: false,
		close: callback
	});
};

/**
 * ȷ��
 * @param	{String}	��Ϣ����
 * @param	{Function}	ȷ����ť�ص�����
 * @param	{Function}	ȡ����ť�ص�����
 */
lhgdialog.confirm = function( content, yes, no )
{
	return lhgdialog({
		title: 'ȷ��',
		id: 'confirm.gif',
		zIndex: _zIndex(),
		icon: 'confirm.gif',
		fixed: true,
		lock: true,
		content: content,
		resize: false,
		ok: function(here){
			return yes.call(this, here);
		},
		cancel: function(here){
			return no && no.call(this, here);
		}
	});
};

/**
 * ����
 * @param	{String}	��������
 * @param	{Function}	�ص�����. ���ղ���������ֵ
 * @param	{String}	Ĭ��ֵ
 */
lhgdialog.prompt = function( content, yes, value )
{
	value = value || '';
	var input;
	
	return lhgdialog({
		title: '����',
		id: 'Prompt',
		zIndex: _zIndex(),
		icon: 'prompt.gif',
		fixed: true,
		lock: true,
		content: [
			'<div style="margin-bottom:5px;font-size:12px">',
				content,
			'</div>',
			'<div>',
				'<input value="',
					value,
				'" style="width:18em;padding:6px 4px" />',
			'</div>'
			].join(''),
		init: function(){
			input = this.DOM.content[0].getElementsByTagName('input')[0];
			input.select();
			input.focus();
		},
		ok: function(here){
			return yes && yes.call(this, input.value, here);
		},
		cancel: true
	});
};

/**
 * ������ʾ
 * @param	{String}	��ʾ����
 * @param   {Number}    ��ʾʱ�� (Ĭ��1.5��)
 * @param	{String}	��ʾͼ�� (ע��Ҫ����չ��)
 * @param   {Function}  ��ʾ�ر�ʱִ�еĻص�����
 */
lhgdialog.tips = function( content, time, icon, callback )
{
	var reIcon = icon ? function(){
	    this.DOM.icon_bg[0].src = this.config.path + 'skins/icons/' + icon;
		this.DOM.icon[0].style.display = '';
		if( callback ) this.config.close = callback;
	} : function(){ this.DOM.icon.hideIt(); };
	
	return lhgdialog({
		id: 'Tips',
		zIndex: _zIndex(),
		title: false,
		cancel: false,
		fixed: true,
		lock: false,
		resize: false,
		close: callback
	})
	.content(content)
	.time(time || 1.5, reIcon);
};

})( this.jQuery||this.lhgcore, this.lhgdialog );