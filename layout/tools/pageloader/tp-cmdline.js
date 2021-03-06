/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is DOM Inspector.
 *
 * The Initial Developer of the Original Code is
 * Christopher A. Aillon <christopher@aillon.com>.
 * Portions created by the Initial Developer are Copyright (C) 2003
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Christopher A. Aillon <christopher@aillon.com>
 *   L. David Baron, Mozilla Corporation <dbaron@dbaron.org> (modified for reftest)
 *   Vladimir Vukicevic, Mozilla Corporation <dbaron@dbaron.org> (modified for tp)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

// This only implements nsICommandLineHandler, since it needs
// to handle multiple arguments.

const nsISupports               = Components.interfaces.nsISupports;
  
const nsICommandLine            = Components.interfaces.nsICommandLine;
const nsICommandLineHandler     = Components.interfaces.nsICommandLineHandler;
const nsISupportsString         = Components.interfaces.nsISupportsString;
const nsIWindowWatcher          = Components.interfaces.nsIWindowWatcher;

function PageLoaderCmdLineHandler() {}
PageLoaderCmdLineHandler.prototype =
{
  classID: Components.ID('{8AF052F5-8EFE-4359-8266-E16498A82E8B}'),

  /* nsISupports */
  QueryInterface : XPCOMUtils.generateQI([nsICommandLineHandler]),

  /* nsICommandLineHandler */
  handle : function handler_handle(cmdLine) {
    var args = {};
    try {
      var uristr = cmdLine.handleFlagWithParam("tp", false);
      if (uristr == null)
        return;
      try {
        args.manifest = cmdLine.resolveURI(uristr).spec;
      } catch (e) {
        return;
      }

      args.numCycles = cmdLine.handleFlagWithParam("tpcycles", false);
      args.startIndex = cmdLine.handleFlagWithParam("tpstart", false);
      args.endIndex = cmdLine.handleFlagWithParam("tpend", false);
      args.filter = cmdLine.handleFlagWithParam("tpfilter", false);
      args.format = cmdLine.handleFlagWithParam("tpformat", false);
      args.useBrowserChrome = cmdLine.handleFlag("tpchrome", false);
      args.doRender = cmdLine.handleFlag("tprender", false);
      args.width = cmdLine.handleFlagWithParam("tpwidth", false);
      args.height = cmdLine.handleFlagWithParam("tpheight", false);
      args.offline = cmdLine.handleFlag("tpoffline", false);
      args.noisy = cmdLine.handleFlag("tpnoisy", false);
      args.timeout = cmdLine.handleFlagWithParam("tptimeout", false);
      args.noForceCC = cmdLine.handleFlag("tpnoforcecc", false);
    }
    catch (e) {
      return;
    }

    // get our data through xpconnect
    args.wrappedJSObject = args;

    var wwatch = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                           .getService(nsIWindowWatcher);
    wwatch.openWindow(null, "chrome://pageloader/content/pageloader.xul", "_blank",
                      "chrome,dialog=no,all", args);
    cmdLine.preventDefault = true;
  },

  helpInfo :
  "  -tp <file>         Run pageload perf tests on given manifest\n" +
  "  -tpfilter str      Only include pages from manifest that contain str (regexp)\n" +
  "  -tpcycles n        Loop through pages n times\n" +
  "  -tpstart n         Start at index n in the manifest\n" +
  "  -tpend n           End with index n in the manifest\n" +
  "  -tpformat f1,f2,.. Report format(s) to use\n" +
  "  -tpchrome          Test with normal browser chrome\n" +
  "  -tprender          Run render-only benchmark for each page\n" +
  "  -tpwidth width     Width of window\n" +
  "  -tpheight height   Height of window\n" +
  "  -tpoffline         Force offline mode\n" +
  "  -tpnoisy           Dump the name of the last loaded page to console\n" + 
  "  -tptimeout         Max amount of time given for a page to load, quit if exceeded\n" +
  "  -tpnoforcecc       Don't force cycle collection between each pageload\n"

};

var NSGetFactory = XPCOMUtils.generateNSGetFactory([PageLoaderCmdLineHandler]);
