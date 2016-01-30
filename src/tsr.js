// Description:
//   Outputs Android:Netrunner's Timing Structure of a Run
//
// Dependencies:
//   none
//
// Configuration:
//   none
//
// Commands:
//   hubot tsr [optional phase] - Output Netrunner's TSR, or a part of it. "phase" can be like 1, 2.1,4.0, initiation, approach, encounter, access, end, unsuccessful, or [phase]-[phase]
//
// Author:
//   SohumB
//
"use strict";


var tsr = {
  sub: {
    "1": {
      text: "The Runner initiates a _*run*_ and declares the _*attacked server*_\n> The Runner then collects Bad Publicity credits\n> If the attacked server has one or more pieces of ice protecting it, go to [Step 2].\n> If the attacked server does not have ice protecting it, go to [Step 4]."
    },
    "2": {
      text: "The Runner _*approaches*_ the outermost piece of ice not already approached on the attacked server",
      sub: {
        "2.1": { text: "Paid abilities may be used." },
        "2.2": {
          text: "The Runner decides whether to continue the run\n> Either the Runner _*jacks out*_: go to [Step 6] _(cannot jack out if this is the first ice approached this run)_\n> Or the Runner continues the run: go to [Step 2.3]"
        },
        "2.3": { text: "Paid abilities may be used, non-ice cards may be rezzed, approached ice may be rezzed." },
        "2.4": {
          text: "Players check to see if the approached ice is rezzed\n> If the approached ice is _*rezzed*_, go to [Step 3].\n> If the approached ice is _*unrezzed*_, the Runner passes it:\n> Go to [Step 2] if there is another piece of ice protecting the server\n> Go to [Step 4] if there is not another piece of ice protecting the server"
        }
      }
    },
    "3": {
      text: "The Runner _*encounters*_ a piece of ice _(\"when encountered\" conditionals meet their trigger conditions)_",
      sub: {
        "3.1": { text: "Paid abilities may be used, icebreakers may interact with encountered ice." },
        "3.2": {
          text: "Resolve all subroutines not broken on the encountered ice\n> Either the run ends: go to [Step 6]\n> Or the Runner _*passes*_ the ice and the run continues:\n> If there is another piece of ice protecting the server, go to [Step 2]\n> If there is not another piece of ice protecting the server, go to [Step 4]."
        }
      }
    },
    "4": {
      text: "The Runner _*approaches*_ the attacked server _(\"When the Runner passes all ice\" conditionals meet their trigger condition)_",
      sub: {
        "4.1": { text: "Paid abilities may be used." },
        "4.2": {
          text: "The Runner decides whether or not to continue the run\n> Either the Runner _*jacks*_ out: go to [Step 6]\n> Or the Runner continues the run: go to [Step 4.3]"
        },
        "4.3": { text: "Paid abilities may be used, non-ice cards may be rezzed" },
        "4.4": { text: "The run is considered to be successful _(\"when successful\" conditionals meet their trigger conditions)_" },
        "4.5": {
          text: "Access cards, then go to [Step 5]\n> If an _*agenda*_ is accessed, the Runner _*steals*_ it.\n> If a card with a _*trash cost*_ is accessed, the Runner may pay its trash cost to _*trash*_ it.\n> All accessed cards not stolen or trashed are returned to the server in their previous states."
        }
      }
    },
    "5": { text: "The run ends." },
    "6": { text: "The run ends and is considered to be _*unsuccessful*_ _(\"when unsuccessful\" conditionals meet their trigger conditions)_" }
  }
};

var names = {
  initiation: "1",
  approach: "2",
  encounter: "3",
  access: "4",
  end: "5",
  unsuccessful: "6"
};

function attachPhases(tsr, phase) {
  if (phase) {
    tsr.phase = phase;
  }

  var sub = tsr.sub || {};
  Object.keys(sub).forEach(function (key) {
    attachPhases(sub[key], key);
  });
}

attachPhases(tsr);

function flatten(tsr) {
  var sub = tsr.sub || {};
  var subArray = Object.keys(sub).sort().map(function (key) {
    return flatten(sub[key]);
  }).reduce(function (acc, next) {
    return acc.concat(next);
  }, []);

  var text = (tsr.phase ? "*" + tsr.phase + "*: " : "") + (tsr.text ? tsr.text : "");
  return (tsr.phase ? [{ text: text, phase: tsr.phase }] : []).concat(subArray);
}

function find(str, tsr) {
  var sub = tsr.sub || {};

  var match = str.match(/^([a-zA-Z0-9\.]+)\.0$/);
  var key = match ? match[1] : str;

  var base = sub[key] || sub[names[key]];
  if (match && base) {
    base = { text: base.text, phase: base.phase };
  }

  return Object.keys(sub).reduce(function (acc, key) {
    if (acc) { return acc; }
    return find(str, sub[key]);
  }, base || null);
}

function range(tsr1, tsr2) {
  return flatten(tsr).reduce(function (acc, line) {
    if (line.phase === tsr1.phase) {
      acc.started = true;
    }
    if (acc.started && !acc.ended) {
      acc.result.push(line);
    }
    if (line.phase === tsr2.phase) {
      acc.ended = true;
    }
    return acc;
  }, { result: [], started: false, ended: false }).result;
}

function last(tsr) {
  if (!tsr.sub) { return tsr; }
  return last(tsr.sub[Object.keys(tsr.sub).sort().reverse()[0]]);
}

module.exports = function (robot) {
  robot.respond(/tsr( ([a-zA-Z0-9\.]*)(-([a-zA-Z0-9\.]*))?)?/, function (res) {
    var from = res.match[2];
    var to = res.match[4];
    if (!from && !to) {
      from = "1";
      to = "6";
    }

    function chattyFind(str) {
      var found = find(str, tsr);
      if (!found) {
        res.send("Could not find TSR section \"" + str + "\"");
      }
      return found;
    }

    function say(flattened) {
      res.send(flattened.map(function (line) {
        return line.text;
      }).join("\n"));
    }

    if (from && to) {
      var start = chattyFind(from);
      var end = chattyFind(to);
      if (start && end) {
        say(range(start, last(end)));
      }
    } else if (from) {
      var section = chattyFind(from);
      if (section) {
        say(flatten(section));
      }
    } else {
      throw new Exception("Something weird has happened! from:" + from + " to:" + to);
    }
  });
};
