const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const app = express();
const session = require('express-session');
const passport = require('passport');

router.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }));

var BnetStrategy = require('passport-bnet').Strategy;
var BNET_ID = process.env.BLIZZARD_CLIENT_ID
var BNET_SECRET = process.env.BLIZZARD_CLIENT_SECRET

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new BnetStrategy({
    clientID: BNET_ID,
    clientSecret: BNET_SECRET,
    callbackURL: process.env.MAIN_CALLBACK_URL,
    region: "us",
}, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

router.get('/', passport.authenticate('bnet', { failureRedirect: '/', session: true }), function(req, res, next) {
    if (req.isAuthenticated()) {
        req.session.bnetToken = req.user.token;
        req.session.battlenetTag = req.user.battletag;
        res.redirect('/diablo/main')
    } else {
        req.session.errorMessage = "There was an error with Blizzard Oauth";
        res.redirect(`/diablo/error`);
    }
});

router.get('/main', function(req, res, next) {
    res.render('pages/diabloenterbattlenet',
        {
            battlenetTag: req.session.battlenetTag
        }
    );
});


router.get('/getInfo/:bnetID', function(req, res, next) {
    //load data into memory
    getDiabloCharacters(res, req, req.params.bnetID).then(() => {

    }).catch((err) => {
        console.log(err)
        req.session.errorMessage = err;
        res.redirect('/diablo/error');
    });

});
 

router.get('/info', function (req, res, next) {
    if (!req.session.user) {
        req.session.errorMessage = "There was no user found matching that Battlenet Id";
        res.redirect(`/diablo/error`);
    } else {
        res.render('pages/diablomain', {
            player: req.session.user,
            characters: req.session.characterList,
            guild: req.session.guild
        });
    }
});

//load items into memory
router.get('/character/:id/getitems/:characterName', (req, res, next) => {
    //res.send(req.params.id);
    getDiabloCharacterItems(res, req, req.params.id, req.params.characterName);
});

//pull items from memory and use them
router.get('/character/:id/items', (req, res, next) => {
    res.render('pages/diablocharacteritems', {
        char: req.session.character,
        items: req.session.items,
        bnet: req.session.user
    });
});


//load skills into memory
router.get('/character/:id/getskills/:characterName', (req, res, next) => {
    //res.send(req.params.id);
    getDiabloCharacterSkills(res, req, req.params.id, req.params.characterName);
});

//pull skills from memory and use them
router.get('/character/:id/skills', (req, res, next) => {
    res.render('pages/diablocharacterskills', {
        char: req.session.character,
        activeSkills: req.session.activeSkills,
        passiveSkills: req.session.passiveSkills,
        bnet: req.session.user
    });
});

router.get('/error/', function(req, res, next) {
    res.send(`There was an error: ${req.session.errorMessage}`);
});

async function getDiabloCharacters (res, req, bnetID) {
//console.log(process.env.MY_DIABLO3_ACCOUNT_INFO_URL + encodeURIComponent(bnetID) + '/?locale=en_US&access_token=' + req.session.bnetToken)
    fetch(process.env.MY_DIABLO3_ACCOUNT_INFO_URL + encodeURIComponent(bnetID) + '/?locale=en_US&access_token=' + req.session.bnetToken)
        .then(res => res.text())
        .then((body) => {
            let result = JSON.parse(body)
            req.session.user = result.battleTag;
            req.session.characterList = result.heroes;
            req.session.guild = result.guildName;
            req.session.save();
            //console.log(req.session.user);
        }).then(() => {
            res.redirect('/diablo/info');
        })
        .catch((err) => {
            console.log(err);
        });
}

async function getDiabloCharacterItems (res, req, heroID, heroName) {
    //console.log(process.env.BLIZZARD_API_URL + encodeURIComponent(req.session.user) + '/hero/' + heroID + '/items?locale=en_US&access_token=' + req.session.bnetToken);
    fetch(process.env.BLIZZARD_API_URL + encodeURIComponent(req.session.user) + '/hero/' + heroID + '/items?locale=en_US&access_token=' + req.session.bnetToken)
        .then(res => res.text())
        .then((body) => {
            let result = JSON.parse(body)
            req.session.items = result;
            req.session.character = heroName;
            req.session.save();
            //console.log(result)
        }).then(() => {
           res.redirect(`/diablo/character/${heroID}/items`);
        })
        .catch((err) => {
            console.log(err);
        });
}

async function getDiabloCharacterSkills (res, req, heroID, heroName) {
    fetch(process.env.BLIZZARD_API_URL + encodeURIComponent(req.session.user) + '/hero/' + heroID + '?locale=en_US&access_token=' + req.session.bnetToken)
        .then(res => res.text())
        .then((body) => {
            let result = JSON.parse(body)
            req.session.activeSkills = result.skills.active;
            req.session.passiveSkills = result.skills.passive;
            req.session.character = heroName;
            req.session.save();
        }).then(() => {
            res.redirect(`/diablo/character/${heroID}/skills`);
        })
        .catch((err) => {
            console.log(err);
        });
}
module.exports = router;