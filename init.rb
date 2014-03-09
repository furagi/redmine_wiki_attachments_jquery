require 'redmine'
require 'wft_asset_helpers'
require 'dispatcher' unless Rails::VERSION::MAJOR >= 3

require 'wiki_files_toolbar_patches'

unless Redmine::Plugin.registered_plugins.keys.include?(WFT_AssetHelpers::PLUGIN_NAME)
	Redmine::Plugin.register WFT_AssetHelpers::PLUGIN_NAME do
	  name 'Wiki files extensions toolbar'
	  author 'Vitaly Klimov'
	  author_url 'mailto:vitaly.klimov@snowbirdgames.com'
	  description 'Wiki toolbar button for quickly inserting attached files names into text'
	  version '0.0.4'

      requires_redmine :version_or_higher => '1.3.0'
	end
end

if Rails::VERSION::MAJOR >= 3
  ActionDispatch::Callbacks.to_prepare do
    require 'wiki_files_toolbar_patches'
  end
else
  Dispatcher.to_prepare WFT_AssetHelpers::PLUGIN_NAME do
    require_dependency 'wiki_files_toolbar_patches'
  end
end
