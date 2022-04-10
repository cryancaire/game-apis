const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const app = express();
const session = require('express-session');
const XIVAPI = require('@xivapi/js');
const xiv = new XIVAPI();

//Error Constants
const STANDARD_API_ERROR = `XIVAPI ERROR`;

router.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }));
router.get('/', function(req, res, next) {
    //console.log(getChar());
    res.render('pages/ff14search', {
        error: req.session.error
    });
});

router.get('/loading', function(req, res, next) {
    getFF14CharacterInfo(req, res, req.session.charID);
});

router.get('/search/:id', function(req, res, next) {
    getFF14CharacterID(req, res, req.params.id);
});

router.get('/character', function(req, res, next) {
    res.render('pages/ff14Main', {
        name: req.session.charName,
        portrait: req.session.portrait,
        avatar: req.session.avatar,
        currentClass: req.session.currentClass,
        jobs: req.session.jobs,
        nameDay: req.session.nameDay,
        dc: req.session.dc,
        freeCompanyName: req.session.freeCompanyName,
        error: req.session.error,
        server: req.session.server
    });
});



router.get('/error/', function(req, res, next) {
    res.send(`There was an error: ${req.session.error}`);
});

async function getFF14CharacterID (req, res, charName) {
    req.session.error = "";
    fetch(process.env.FF14_API_URL + 'character/search?name=' + encodeURIComponent(charName))
        .then(res => res.text())
        .then((body) => {
            let result = JSON.parse(body)
            if (result.Error) {
                if (result.Subject === STANDARD_API_ERROR) {
                    req.session.error = `There was an error retrieving the data. Please try again later.`;
                } else {
                    req.session.error = `${result.Subject} Please try again later.`;
                }
            } else if (result.Pagination["Results"] == 0) {
                req.session.error = `Character ${charName} not found!`;
            } else {
                req.session.charID = result.Results[0].ID;
            }
        }).then(() => {
            if (req.session.error) {
                res.redirect('/ff14');
            } else {
                res.redirect('/ff14/loading');
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

async function getFF14CharacterInfo (req, res, charName) {
    req.session.error = "";
    fetch(process.env.FF14_API_URL + 'character/' + encodeURIComponent(charName) + `?extended=1`)
        .then(res => res.text())
        .then((body) => {
            let result = JSON.parse(body)
            if (result.Character) {
                sortedJobs = result.Character["ClassJobs"].sort((a,b) => (a.Level < b.Level) ? 1: -1);
                req.session.charName = result.Character["Name"];
                req.session.currentClass = result.Character["ActiveClassJob"];
                req.session.avatar = result.Character["Avatar"];
                req.session.dc = result.Character["DC"];
                req.session.jobs = sortedJobs;
                req.session.nameDay = result.Character["Nameday"];
                req.session.portrait = result.Character["Portrait"];
                req.session.freeCompanyName = result.Character["FreeCompanyName"];
                req.session.server = result.Character["Server"];
            } else {
                req.session.error = `Character ${charName} not found!`;
            }
        }).then(() => {
            if (req.session.error) {
                res.redirect('/ff14');
            } else {
                res.redirect('/ff14/character');
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

/* async function getChar() {
    let res = await xiv.character.search("R'hafl Cahpt'hur", {server: 'cactuar'}) //case insensitive server names, btw ;)

  //get the character
  let char = res.Results[0]

  //return whether or not the character's lodestone bio matches our token
  return char;
} */

module.exports = router;