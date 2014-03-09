var include_static_attachments = false;
var list_of_attached_files = new Array();
var list_of_newly_attached_files = new Array();
var list_of_preattached_files = new Array();
var waf_menu_displayed=false;
var wiki_extensions_installed;
var FB_FILES_TYPES_ARRAY = [
// default type should always be first!
	{type:'attach', ext:[]},
	{type:'image', ext:['JPG','JPEG','GIF','PNG','BMP']},
	{type:'xls', ext:['XLS']},
	{type:'mp3', ext:['MP3']}
];
var FB_FUNCTIONS_ARRAY = [
// default type should always be first!
	{type:'attach',filetypes:[],pfx:'attachment:',sfx:"\n",sym:'a',link:true},
	{type:'image',filetypes:['image'],'pfx':'!',sfx:'!',sym:'p',link:false},
	{type:'xls',filetypes:['xls'],'pfx':'{{xls_show(attach,',sfx:",0)}}\n",sym:'x',link:true},
	{type:'mp3',filetypes:['mp3'],'pfx':'{{play_sound(',sfx:",2)}}\n",sym:'w',link:true},
	{type:'image_size',filetypes:['image'],'pfx':'!{width:500px}',sfx:"!\n",sym:'i',link:true},
	{type:'gallery',filetypes:['image'],'pfx':"{{lightbox(\"",sfx:"\")}}\n",sym:'g',link:true}
];


var _uniq = function(array) {
	var counter = array.length - 1;
	for (var i = 0; i < counter; i++) {
		var copyIndex = array.indexOf(array[i], i + 1);
		if(copyIndex > -1) {
			array.splice(copyIndex, 1);
			counter--;
		}
	};
	return array;
};

function retrieveAttachedFilesList() {
	var attachments;
	var files_list;
	var i;
	var s='';

	list_of_attached_files.length=0;
	list_of_newly_attached_files.length=0;

	for (i=0; i < list_of_preattached_files.length; i++) {
		list_of_attached_files.push(list_of_preattached_files[i]);
	}

	if (include_static_attachments ) {
		attachments = $('.attachments');
		if(attachments && attachments.length > 0) {
			files_list=attachments[0].find('.icon-attachment');

			for (i=0; i < files_list.length; i++) {
				s=files_list[i].innerHTML;
				if(s != '') { list_of_attached_files.push(s); }
			}
		}
	}

	var attachments_new = $('#attachments_fields');

	if(attachments_new && attachments_new.length > 0) {
		files_list=$(attachments_new[0]).find('input.filename');

		for (i=0; i < files_list.length; i++) {
			s = files_list[i].value.replace(/^.*(\\|\/|:)/, '');
			s = s.replace(/[\/\?\%\*\:\|\"\'<>]/g,'_');
			if(s != '') {
				list_of_attached_files.push(s);
				list_of_newly_attached_files.push(s);
			}
		}
	}


	if(list_of_attached_files.length > 0) {
		list_of_attached_files = _uniq(list_of_attached_files);
		list_of_attached_files.sort(function(a,b) {return a.toUpperCase().localeCompare(b.toUpperCase());} );
	}

	if(list_of_newly_attached_files.length > 0) {
		list_of_newly_attached_files = _uniq(list_of_newly_attached_files, false);
		list_of_newly_attached_files.sort(function(a,b) {return a.toUpperCase().localeCompare(b.toUpperCase());} );
	}
};

function guessAttachmentType(_name) {
	var file_ext;

	file_ext=_name.match(/^(.+)\.([^ .]+?)$/);
	if( file_ext && file_ext.length > 2 )
	{
		var i;
		var file_ext_str=file_ext[2].toUpperCase();

		for(i=0;i<FB_FILES_TYPES_ARRAY.length;i++) {
			if(FB_FILES_TYPES_ARRAY[i].ext.indexOf(file_ext_str) > -1) {
				return FB_FILES_TYPES_ARRAY[i].type;
			}
		}
	}
	return FB_FILES_TYPES_ARRAY[0].type;
}

function convertToWikiAttachment(_name_id,_mode) {
	var f_elem;
	var ret_str='';
	var i;

	f_elem=findButtonFunctionByType(_mode);
	switch(_name_id) {
		case -2:
// newly added
			for(i=0;i<list_of_newly_attached_files.length;i++) {
				ret_str+=(f_elem.pfx+list_of_newly_attached_files[i]+f_elem.sfx);
			}
			break;
		case -1:
// all files
			for(i=0;i<list_of_attached_files.length;i++) {
				ret_str+=(f_elem.pfx+list_of_attached_files[i]+f_elem.sfx);
			}
			break;
		default:
			ret_str=f_elem.pfx+list_of_attached_files[_name_id]+f_elem.sfx;
			break;
	}
	return ret_str;
}

function findButtonFunctionByType(tp) {
	var i;

	for(i = 0; i < FB_FUNCTIONS_ARRAY.length; i++) {
		if(FB_FUNCTIONS_ARRAY[i].type==tp) {
			return FB_FUNCTIONS_ARRAY[i];
		}
	}
	return FB_FUNCTIONS_ARRAY[0]
}

function createLinkToAttachment(This, dom_ptr, _name, attach_id, mode_id) {
	var a_elem;
	var f_type;
	var mode=mode_id;
	var bf_elem;
	if(!dom_ptr.jquery) dom_ptr = $(dom_ptr);

	if(attach_id < 0) f_type = (mode_id==='' ? 'attach' : mode_id);
	else f_type = guessAttachmentType(_name);

	if(mode === '') mode = f_type;
	bf_elem = findButtonFunctionByType(mode);
	if(attach_id >= 0 && bf_elem.filetypes.length > 0 && bf_elem.filetypes.indexOf(f_type) === -1) {
		return null;
	}

	a_elem = $('<a>', {href : '#', a_id : attach_id, a_mode : mode });
	
	if(mode_id === '') a_elem.html(_name);
	else a_elem.html('('+ bf_elem.sym +')');

	dom_ptr.append(a_elem);
	a_elem.click(function(event) {
		try {
			This.encloseSelection(convertToWikiAttachment(
				parseInt(this.attributes.a_id.value),
				this.attributes.a_mode.value
			));
			waf_menu_displayed = false;
			dom_ptr.remove();
		} catch (e) {}
		event.preventDefault();
		return false;
	});

	return a_elem;
}

function jsFilelist(title, fn, scope, className) {
	if(typeof jsToolBar.strings == 'undefined') {
		this.title = title || null;
	} else {
		this.title = jsToolBar.strings[title] || title || null;
	}
	this.fn = fn || function(){};
	this.scope = scope || null;
	this.className = className || null;
}

jsFilelist.prototype.draw = function() {
	if (!this.scope) return null;

	var button = document.createElement('button');
	button.setAttribute('type','button');
	button.tabIndex = 200;
	if (this.className) button.className = this.className;
	button.title = this.title;
	var span = document.createElement('span');
	span.appendChild(document.createTextNode(this.title));
	button.appendChild(span);

	if (this.icon) button.style.backgroundImage = 'url('+this.icon+')';

	if (typeof(this.fn) == 'function') {
		var This = this;
		button.onclick = function() { try { This.fn.apply(This.scope, arguments) } catch (e) {} return false; };
	}

	var list_div=document.createElement('span');
	list_div.className="jstb_filelist_div";

	var main_div=document.createElement('span');
	main_div.className="jstb_filelist_main_div";

	main_div.appendChild(button);
	main_div.appendChild(list_div);

	return main_div;
};

jsToolBar.prototype.filelist = function(toolName) {
	var tool = this.elements[toolName];
	if (typeof tool.fn[this.mode] != 'function') return null;
	var b = new jsFilelist(tool.title, tool.fn[this.mode], this, 'jstb_'+toolName);
	if (tool.icon != undefined) b.icon = tool.icon;
	return b;
};

// spacer
jsToolBar.prototype.elements.space_fl = {
		type: 'space'
};

// file list
jsToolBar.prototype.elements.filelist = {
	type:'filelist',
	title:'filelist',
	fn:{
		wiki:function () {
			retrieveAttachedFilesList();
			var base_div = $(this.toolbar).find("span.jstb_filelist_div:first");
			var h = base_div.find('span.jstb_filelist_div_inner:first');

			if (h.length) {
				h.remove();
			}
			else {
				if (list_of_attached_files.length > 0) {
					var base_div_offset, h_offset;

					h = $('<span>', {'class':'jstb_filelist_div_inner'});

					base_div.prepend(h);

// lets position element right under parent
					base_div_offset=base_div.offset();
					h_offset=h.offset();
					h.css({
						left: (base_div_offset.left-h_offset.left-(wiki_extensions_installed ? 60 : 30))+'px',
						top: (base_div_offset.top-h_offset.top+30)+'px'
					});
//

					waf_menu_displayed = true;

					var i,j;
					var This = this;

					for (i = 0; i < list_of_attached_files.length; i++) {
						for(j=0;j<FB_FUNCTIONS_ARRAY.length;j++) {
							if(FB_FUNCTIONS_ARRAY[j].link) {
								createLinkToAttachment(This, h, list_of_attached_files[i], i, FB_FUNCTIONS_ARRAY[j].type);
							}
						}
						createLinkToAttachment(This, h, list_of_attached_files[i], i, '');
						h.append('<br />');
					}

					if (list_of_newly_attached_files.length > 0) {
// only recent files
						for(j=0;j<FB_FUNCTIONS_ARRAY.length;j++) {
							if(FB_FUNCTIONS_ARRAY[j].link) {
								createLinkToAttachment(This, h, jsFilelist.strings['recent_attachments'], -2, FB_FUNCTIONS_ARRAY[j].type);
							}
						}
						createLinkToAttachment(This, h, jsFilelist.strings['recent_attachments'], -2, '');
						h.append('<br />');
					}
// and all of them together
					for(j=0;j<FB_FUNCTIONS_ARRAY.length;j++) {
						if(FB_FUNCTIONS_ARRAY[j].link) {
							createLinkToAttachment(This, h, jsFilelist.strings['all_attachments'], -1, FB_FUNCTIONS_ARRAY[j].type);
						}
					}
					createLinkToAttachment(This, h, jsFilelist.strings['all_attachments'], -1, '');
					h.append('<br />');
				}
			}
		}
	}
};

$(document).click(function(event) {
	if(waf_menu_displayed) {
		var e = $(event.target).closest(".jstb_filelist_main_div");

		if(!e || e == document) {
			var base_divs=$(".jstb_filelist_div");
			var i;
			var h;

			if(base_divs.length > 0) {
				waf_menu_displayed=false;
				for(i=0;i<base_divs.length;i++) {
					h = base_divs[i]('span.jstb_filelist_div_inner:first');
					if(h.length) {
						h.remove();
					}
				}
			}
		}
	}
});

