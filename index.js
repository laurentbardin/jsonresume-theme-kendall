var fs = require('fs');
var _ = require('lodash');
var gravatar = require('gravatar');
var Mustache = require('mustache');

var d = new Date();
var curyear = d.getFullYear();
var lang = 'en';

var monthNames = {
    '01': {
        'en': 'January',
        'fr': 'Janvier',
    },
    '02': {
        'en': 'February',
        'fr': 'Février',
    },
    '03': {
        'en': 'March',
        'fr': 'Mars',
    },
    '04': {
        'en': 'April',
        'fr': 'Avril',
    },
    '05': {
        'en': 'May',
        'fr': 'Mai',
    },
    '06': {
        'en': 'June',
        'fr': 'Juin',
    },
    '07': {
        'en': 'July',
        'fr': 'Juillet',
    },
    '08': {
        'en': 'August',
        'fr': 'Août',
    },
    '09': {
        'en': 'September',
        'fr': 'Septembre',
    },
    '10': {
        'en': 'October',
        'fr': 'Octobre',
    },
    '11': {
        'en': 'November',
        'fr': 'Novembre',
    },
    '12': {
        'en': 'December',
        'fr': 'Décembre',
    },
}

function getMonth(startDateStr) {
    var month = startDateStr.substr(5, 2);

    if (monthNames[month] != undefined) {
        if (monthNames[month][lang] != undefined) {
            return monthNames[month][lang];
        } else {
            return monthNames[month]['en'];
        }
    }

    return '';
}

function render(resumeObject) {

    if (resumeObject.meta.lang != undefined) {
        lang = resumeObject.meta.lang;
    }

    resumeObject.basics.capitalName = resumeObject.basics.name.toUpperCase();
    if(resumeObject.basics && resumeObject.basics.email) {
        resumeObject.basics.gravatar = gravatar.url(resumeObject.basics.email, {
                        s: '200',
                        r: 'pg',
                        d: 'mm'
                    });
    }
    if (resumeObject.basics.image || resumeObject.basics.gravatar) {
        resumeObject.photo = resumeObject.basics.image ? resumeObject.basics.image : resumeObject.basics.gravatar;
    }

    _.each(resumeObject.basics.profiles, function(p){
        switch(p.network.toLowerCase()) {
            // special cases
            case "google-plus":
            case "googleplus":
                p.iconClass = "fab fa-google-plus";
                break;
            case "flickr":
            case "flicker":
                p.iconClass = "fab fa-flickr";
                break;
            case "dribbble":
            case "dribble":
                p.iconClass = "fab fa-dribbble";
                break;
            case "codepen":
                p.iconClass = "fab fa-codepen";
                break;
            case "soundcloud":
                p.iconClass = "fab fa-soundcloud";
                break;
            case "reddit":
                p.iconClass = "fab fa-reddit";
                break;
            case "tumblr":
            case "tumbler":
                p.iconClass = "fab fa-tumblr";
                break;
            case "stack-overflow":
            case "stackoverflow":
                p.iconClass = "fab fa-stack-overflow";
                break;
            case "blog":
            case "rss":
                p.iconClass = "fas fa-rss";
                break;
            case "gitlab":
                p.iconClass = "fab fa-gitlab";
                break;
            case "keybase":
                p.iconClass = "fas fa-key";
                break;
            default:
                // try to automatically select the icon based on the name
                p.iconClass = "fab fa-" + p.network.toLowerCase();
        }

        if (p.url) {
            p.text = p.url;
        } else {
            p.text = p.network + ": " + p.username;
        }
    });

    if (resumeObject.work && resumeObject.work.length) {
        resumeObject.workBool = true;
        _.each(resumeObject.work, function(w){
            if (w.startDate) {
                w.startDateYear = (w.startDate || "").substr(0,4);
                w.startDateMonth = getMonth(w.startDate || "");
            }
            if(w.endDate) {
                w.endDateYear = (w.endDate || "").substr(0,4);
                w.endDateMonth = getMonth(w.endDate || "");
            } else {
                w.endDateYear = 'Present'
            }
            if (w.highlights) {
                if (w.highlights[0]) {
                    if (w.highlights[0] != "") {
                        w.boolHighlights = true;
                    }
                }
            }
        });
    }

    if (resumeObject.volunteer && resumeObject.volunteer.length) {
        resumeObject.volunteerBool = true;
        _.each(resumeObject.volunteer, function(w){
            if (w.startDate) {
                w.startDateYear = (w.startDate || "").substr(0,4);
                w.startDateMonth = getMonth(w.startDate || "");

            }
            if(w.endDate) {
                w.endDateYear = (w.endDate || "").substr(0,4);
                w.endDateMonth = getMonth(w.endDate || "");
            } else {
                w.endDateYear = 'Present'
            }
            if (w.highlights) {
                if (w.highlights[0]) {
                    if (w.highlights[0] != "") {
                        w.boolHighlights = true;
                    }
                }
            }
        });
    }

    if (resumeObject.projects && resumeObject.projects.length) {
        if (resumeObject.projects[0].name) {
            resumeObject.projectsBool = true;
        }
    }

    if (resumeObject.education && resumeObject.education.length) {
        if (resumeObject.education[0].institution) {
            resumeObject.educationBool = true;
            _.each(resumeObject.education, function(e){
                if( !e.area || !e.studyType ){
                  e.educationDetail = (e.area == null ? '' : e.area) + (e.studyType == null ? '' : e.studyType);
                } else {
                  e.educationDetail = e.area + ", "+ e.studyType;
                }
                if (e.startDate) {
                    e.startDateYear = e.startDate.substr(0,4);
                    e.startDateMonth = getMonth(e.startDate || "");
                } else {
                    e.endDateMonth = "";
                }
                if (e.endDate) {
                    e.endDateYear = e.endDate.substr(0,4);
                    e.endDateMonth = getMonth(e.endDate || "")

                    if (e.endDateYear > curyear) {
                        e.endDateYear += " (expected)";
                    }
                } else {
                    e.endDateYear = 'Present'
                    e.endDateMonth = '';
                }
                e.showDate = e.endDateYear && e.startDateYear ? true : false;
                if (e.courses) {
                    if (e.courses[0]) {
                        if (e.courses[0] != "") {
                            e.educationCourses = true;
                        }
                    }
                }
            });
            resumeObject.educationTimeline = !_.every(resumeObject.education, ['showDate', false]);
        }
    }

    if (resumeObject.awards && resumeObject.awards.length) {
        if (resumeObject.awards[0].title) {
            resumeObject.awardsBool = true;
            _.each(resumeObject.awards, function(a){
                a.year = (a.date || "").substr(0,4);
                a.day = (a.date || "").substr(8,2);
                a.month = getMonth(a.date || "");
            });
        }
    }

    if (resumeObject.publications && resumeObject.publications.length) {
        if (resumeObject.publications[0].name) {
            resumeObject.publicationsBool = true;
            _.each(resumeObject.publications, function(a){
                a.year = (a.releaseDate || "").substr(0,4);
                a.day = (a.releaseDate || "").substr(8,2);
                a.month = getMonth(a.releaseDate || "");
            });
        }
    }

    if (resumeObject.skills && resumeObject.skills.length) {
        if (resumeObject.skills[0].name) {
            resumeObject.skillsBool = true;
        }
    }

    if (resumeObject.interests && resumeObject.interests.length) {
        if (resumeObject.interests[0].name) {
            resumeObject.interestsBool = true;
        }
    }

    if (resumeObject.languages && resumeObject.languages.length) {
        if (resumeObject.languages[0].language) {
            resumeObject.languagesBool = true;
        }
    }

    if (resumeObject.references && resumeObject.references.length) {
        if (resumeObject.references[0].name) {
            resumeObject.referencesBool = true;
        }
    }

    // If a lang is defined, try and find the corresponding template, otherwise
    // fallback to the default template file.
    var template = 'resume.' + lang + '.template';

    try {
        var theme = fs.readFileSync(__dirname + '/' + template, 'utf8');
    } catch (err) {
        if (err.code == 'ENOENT') {
            var theme = fs.readFileSync(__dirname + '/resume.template', 'utf8');
        } else {
            throw err;
        }
    }

    resumeObject.css = fs.readFileSync(__dirname + "/style.css", "utf-8");
    resumeObject.printcss = fs.readFileSync(__dirname + "/print.css", "utf-8");
    var resumeHTML = Mustache.render(theme, resumeObject);

    return resumeHTML;
};
module.exports = {
    render: render
}
