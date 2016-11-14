
1.14.0 / 2016-11-14
==================

  * can 'exclude' a tag or list of tags from logging

1.13.0 / 2016-09-05
==================

  * updated lodash
  * use instanceof Error intead of lodash `_.isError` because of false positives

1.12.0 / 2016-09-05
==================

  * allow multiple 'types'

1.11.0 / 2016-08-01
==================

  * can accept plugins, either as functions or as 'require'-able strings

1.10.0 / 2016-07-31
==================

  * recognizes Error objects and treats them as such

1.9.0 / 2016-07-18
==================

  * added travis support and badge for readme
  * updated cli defaults and tests
  * 'warn' tag has the same effect as 'warning' (i.e. bgYellow)

1.8.0 / 2016-04-29
==================

  * now lets you use 'setDefaults' to set the default config for all running instances of Logr

1.7.0 / 2016-03-31
==================

  * added test for logging object, cli also supports no tags now, needs merge with tagsOptional to enable it
  * no console bell for cli, cli also now resets color after message is printed
  * uses original color names,  added tagless support to cli type
  * lets you print with no tags if no default specified, added test case to support this
  * by default colors refer to foreground unless prepended with bg.  default colors use bg color
  * cli added, supports 'lineColor' renderOption, colors.js moved to its own file
  * split colors into its own file
  * supports background colors, added tests to verify
  * added test cases
  * fixing
  * tests added for tagless option
  * Merge pull request #3 from firstandthird/withDing
  * index handles no tag option
  * cleaned up 'for' statement with _.intersection
  * added extra test conditions
  * dings on specific tags, lets you specify which tags (default is 'error') updated tests that contain 'error' tag to reflect this
  * by default, the 'ding' tag is enabled
  * must pass 'ding' tag
  * has a ding now

1.6.0 / 2016-03-14
==================

  * support LOGR_TYPE=false in env var
  * if type: false, don't output
  * added support for overriding filters with LOGR_FILTER env var
  * added ability to override type with LOGR_TYPE env var

1.5.0 / 2016-03-06
==================

  * nevermind - removing browserify

1.4.0 / 2016-03-06
==================

  * added transform for browserify

1.3.0 / 2016-03-03
==================

  * allow defaultTags to be set for all logs

1.2.0 / 2016-03-01
==================

  * support escaped newlines

1.1.0 / 2016-03-01
==================

  * swapped aug with lodash
  * color tags
  * [console] pretty print json
  * refactor options passing to be render specfic
  * moved renderers to separate file

1.0.0 / 2016-02-24
==================

  * complete rewrite, change to tag based
  * square one
