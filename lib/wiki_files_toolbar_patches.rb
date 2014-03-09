require 'wft_asset_helpers'
require_dependency 'redmine/wiki_formatting/textile/helper'

module WikiFilesToolbar
  module Patches
    module WikiToolbarPatch
      def self.included(base) # :nodoc:
        base.send(:include, InstanceMethods)

        base.class_eval do
          unloadable # Send unloadable so it will not be unloaded in development
          alias_method_chain :heads_for_wiki_formatter, :filelist
        end

      end

      module ClassMethods
      end

      module InstanceMethods
        def heads_for_wiki_formatter_with_filelist
          heads_for_wiki_formatter_without_filelist
          unless @heads_for_wiki_filelist_included

            should_include_button=false
            files_container=nil
            # trying to determine from which part of redmine we were included
            if @page != nil && @page.is_a?(WikiPage)
            # wiki page edit - should add all attached files to list
              should_include_button=true
              files_container=@page.attachments
            else
              if (@topic != nil && @topic.is_a?(Message)) || (@message != nil && @message.is_a?(Message))
                # including files from current message
                should_include_button=true
                files_container=@message.attachments  if @message != nil && @message.is_a?(Message) && @reply_pages == nil
              else
                if @issue && @issue.is_a?(Issue)
                  files_container=@issue.attachments
                  should_include_button=true
                end
              end
            end

            content_for :header_tags do
              o = ''
              o << stylesheet_link_tag("wiki_attached_files_list.css", :plugin => WFT_AssetHelpers::PLUGIN_NAME.to_s)
              o << javascript_include_tag('wiki_attached_files_list.js', :plugin => WFT_AssetHelpers::PLUGIN_NAME.to_s)

              o << '<script type="text/javascript">'
              o << "\n"
              # fix for wrong positioning bug in wiki extensions
              o << "wiki_extensions_installed=#{Redmine::Plugin.registered_plugins.keys.include?(:redmine_wiki_extensions) ? 'true' : 'false'};\n"
              o << "jsToolBar.prototype.elements.filelist.title='#{l(:wftb_toolbar_title)}'\n"
              o << "jsFilelist.strings={};"
              o << "jsFilelist.strings['all_attachments']='#{l(:wftb_insert_all_files)}';"
              o << "jsFilelist.strings['recent_attachments']='#{l(:wftb_insert_recent_files)}';"
              o << "\n"

              files_container.each do |file|
                o << "list_of_preattached_files.push('#{file.filename}');\n"
              end if files_container

              o << "\n</script>\n"
              o.html_safe
            end if should_include_button
            @heads_for_wiki_filelist_included = true
          end
        end
      end
    end
  end
end

unless Redmine::WikiFormatting::Textile::Helper.included_modules.include? WikiFilesToolbar::Patches::WikiToolbarPatch
 Redmine::WikiFormatting::Textile::Helper.send(:include,WikiFilesToolbar::Patches::WikiToolbarPatch)
end
