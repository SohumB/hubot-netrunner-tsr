# hubot-netrunner-tsr

A hubot script to output netrunner's timing structure of a run.

## Installation

In the hubot project repo, run:

`npm install hubot-netrunner-tsr --save`

Then add **hubot-netrunner-tsr** to your `external-scripts.json`:

```json
["hubot-netrunner-tsr"]
```

## Sample Interaction

```
user1>> hubot tsr 4.3
hubot>> *4.3*: Paid abilities may be used, non-ice cards may be rezzed
user2>> hubot tsr approach-encounter
hubot>> *2*: The Runner _*approaches*_ the outermost piece of ice not already approached on the attacked server
*2.1*: Paid abilities may be used.
*2.2*: The Runner decides whether to continue the run
> Either the Runner _*jacks out*_: go to [Step 6] _(cannot jack out if this is the first ice approached this run)_
> Or the Runner continues the run: go to [Step 2.3]
*2.3*: Paid abilities may be used, non-ice cards may be rezzed, approached ice may be rezzed.
*2.4*: Players check to see if the approached ice is rezzed
> If the approached ice is _*rezzed*_, go to [Step 3].
> If the approached ice is _*unrezzed*_, the Runner passes it:
> Go to [Step 2] if there is another piece of ice protecting the server
> Go to [Step 4] if there is not another piece of ice protecting the server
*3*: The Runner _*encounters*_ a piece of ice _("when encountered" conditionals meet their trigger conditions)_
*3.1*: Paid abilities may be used, icebreakers may interact with encountered ice.
*3.2*: Resolve all subroutines not broken on the encountered ice
> Either the run ends: go to [Step 6]
> Or the Runner _*passes*_ the ice and the run continues:
> If there is another piece of ice protecting the server, go to [Step 2]
> If there is not another piece of ice protecting the server, go to [Step 4].
user3>> caprice triggers in tsr/4.0
hubot>> *4*: The Runner _*approaches*_ the attacked server _("When the Runner passes all ice" conditionals meet their trigger condition)_
```
