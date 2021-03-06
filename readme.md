# RoboWarJS #

A programming game inspired by [RoboWar][robowar], a Mac and Windows game from the 90's, where you would program robots using a simple stack-based language and pit them against each other.

While it is heavily inspired by RoboWar, unlike ports like [JSRoboWar][jsrobowar], this project doesn't aim to replicate the original game or its [RoboTalk][robowar-tutorial] language.  While the language is very similar, I want to explore different robot mechanics and features.  For example, instead of `speedx` and `speedy` variables, we have `spd` and `hdg`.

Eventually, I want to make the simulation code run on a server with nodejs, in order to provide a canonical repository of robots with leaderboards etc.

[robowar]: http://robowar.sourceforge.net/RoboWar5/index.html
[robowar-tutorial]: http://www.stanford.edu/~pch/robowar/tutorial/Tutorial.html
[jsrobowar]: https://github.com/statico/jsrobowar
