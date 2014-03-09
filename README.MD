I just adapted these http://www.redmine.org/plugins/redmine_wiki_files_toolbar Redmine's plugin to jQuery (older version used Prototype) and new version of Redmine (v. > 2.3).

h2. Redmine wiki files toolbar

Plugin adds button which allows to quickly insert names of attachments to wiki toolbar for issues, messages and wiki pages.

Plugin displays filenames of already attached files and new ones which are in 'Files' fields as well

h3. Usage

Click on the paperclip button in wiki toolbar, then select how you want to insert filename into the text.

* Simple click to file name - insert using default method based on file extension
* *(a)* - insert as a link to attachment
* *(i)* - insert as an image with default witdth of 500px
* *(x)* - insert as a XLS table (_xls_show_ wiki macro)
* *(w)* - insert _play_sound_ wiki macro
* *(g)* - insert _lightbox_ wiki macro

Also it is possible to add all recently added files or all attached files in one click

h3. History

0.0.5

* jQuery compatibility.
* Redmine 2.3.* compatibility.

0.0.4

* Redmine 2.x (Rails 3.x) compatibility
* Wiki extensions positioning bug workaround

0.0.3

* JS code rewritten
* _lightbox_ macro support added

0.0.2

* First public release

