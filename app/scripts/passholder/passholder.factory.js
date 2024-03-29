'use strict';

/**
 * @ngdoc service
 * @name ubr.passholder.Passholder
 * @description
 * # Passholder factory
 * Factory in the ubr.passholder module.
 */
angular
  .module('ubr.passholder')
  .factory('Passholder', passholderFactory);

/* @ngInject */
function passholderFactory(moment, day) {

  function parseJsonContact(passholder, jsonContact) {
    if (jsonContact) {
      passholder.contact = {
        email: jsonContact.email || '',
        telephoneNumber: jsonContact.telephoneNumber || '',
        mobileNumber: jsonContact.mobileNumber || ''
      };
    } else {
      passholder.contact = {
        email: '',
        telephoneNumber: '',
        mobileNumber: ''
      };
    }
  }

  function parseJsonKansenStatuten(passholder, jsonKansenStatuten) {
    if (jsonKansenStatuten) {
      var kansenstatuten = [];

      angular.forEach(jsonKansenStatuten, function (jsonKansenStatuut) {
        var kansenStatuut = {
          status: jsonKansenStatuut.status,
          endDate: day(jsonKansenStatuut.endDate, 'YYYY-MM-DD').toDate(),
          cardSystem: {
            id: jsonKansenStatuut.cardSystem.id,
            name: jsonKansenStatuut.cardSystem.name
          }
        };
        kansenstatuten.push(kansenStatuut);
      });

      passholder.kansenStatuten = kansenstatuten;
    }
  }

  /**
   * @param {Object} jsonPassen
   * @return {Pass[]}
   */
  function parseJsonUitPassen(jsonPassen) {
    var passen = [];

    if(jsonPassen) {
      angular.forEach(jsonPassen, function (jsonPass) {
        var pass = angular.copy(jsonPass);
        passen.push(pass);
      });
    }

    return passen;
  }

  /**
   * @class Passholder
   * @constructor
   * @param {object}  [jsonPassholder]
   */
  var Passholder = function (jsonPassholder) {
    this.name = {
      first: '',
      last: ''
    };
    this.address = {
      street: '',
      postalCode: '',
      city: ''
    };
    this.birth = {
      date: null,
      place: ''
    };
    this.inszNumber = '';
    this.picture = '';
    this.gender = '';
    this.nationality = '';
    this.privacy = {
      email: false,
      sms: false
    };
    this.contact = {
      email: '',
      telephoneNumber: '',
      mobileNumber: ''
    };
    this.optInPreferences = {
      serviceMails: false,
      milestoneMails: false,
      infoMails: false,
      sms: false,
      post: false
    };
    this.points = 0;
    this.kansenStatuten = [];
    this.uitPassen = [];
    this.remarks = '';
    this.school = null;

    if (jsonPassholder) {
      this.parseJson(jsonPassholder);
    }
  };

  Passholder.prototype = {
    parseJson: function (jsonPassholder) {
      this.name = jsonPassholder.name;
      this.address = jsonPassholder.address;
      if (jsonPassholder.birth) {
        this.birth = {
          date: (jsonPassholder.birth.date ? day(jsonPassholder.birth.date, 'YYYY-MM-DD').toDate() : null),
          place: jsonPassholder.birth.place
        };
      }
      if (jsonPassholder.inszNumber) {
        this.inszNumber = jsonPassholder.inszNumber;
      }
      if (jsonPassholder.picture) {
        this.picture = jsonPassholder.picture;
      }
      this.gender = jsonPassholder.gender;
      this.nationality = jsonPassholder.nationality;
      this.privacy = jsonPassholder.privacy;
      parseJsonContact(this, jsonPassholder.contact);
      parseJsonKansenStatuten(this, jsonPassholder.kansenStatuten);
      this.points = jsonPassholder.points;
      this.uid = jsonPassholder.uid;
      this.remarks = jsonPassholder.remarks || '';
      this.school = jsonPassholder.school || null;
      this.uitPassen = parseJsonUitPassen(jsonPassholder.uitpassen);
      this.cardSystems = (jsonPassholder.cardSystems ? jsonPassholder.cardSystems : []);
      if (jsonPassholder.optInPreferences) {
        this.optInPreferences = {
          serviceMails: jsonPassholder.optInPreferences.serviceMails,
          milestoneMails: jsonPassholder.optInPreferences.milestoneMails,
          infoMails: jsonPassholder.optInPreferences.infoMails,
          sms: jsonPassholder.optInPreferences.sms,
          post: jsonPassholder.optInPreferences.post,
        };
      }
    },
    getKansenstatuutByCardSystemID: function (cardSystemID) {
      var passholder = this,
          matchingKansenstatuut = null;

      angular.forEach(passholder.kansenStatuten, function (kansenstatuut) {
        if (kansenstatuut.cardSystem.id === cardSystemID) {
          matchingKansenstatuut = kansenstatuut;
        }
      });

      return matchingKansenstatuut;
    },
    getUitpasStatusInCardSystemID: function (cardSystemID) {
      var passholder = this,
          status = null;

      angular.forEach(passholder.uitPassen, function (uitpas) {
        if (uitpas.cardSystem.id === cardSystemID) {
          status = uitpas.status;
        }
      });

      return status;
    },
    serialize: function () {
      var serializedPassholder = angular.copy(this);

      serializedPassholder.birth.date = (this.birth.date ? moment(this.birth.date).format('YYYY-MM-DD') : null);

      angular.forEach(this.kansenStatuten, function (kansenStatuut, key) {
        serializedPassholder.kansenStatuten[key].endDate = (kansenStatuut.endDate ? moment(kansenStatuut.endDate).format('YYYY-MM-DD') : null);
      });

      delete serializedPassholder.uitPassen;

      return serializedPassholder;
    },
    getFullName: function() {
      var name = this.name.first;
      if (this.name.middle) {
        name += ' ' + this.name.middle;
      }
      name += ' ' + this.name.last;
      return name;
    },
    getNames: function() {
      var name = this.name.first;
      if (this.name.middle) {
        name += ' ' + this.name.middle;
      }
      return name;
    },
    hasUitPasInCardSystem: function (cardSystem) {
      var matchingCardSystem = false;

      angular.forEach(this.uitPassen, function (uitpas) {
        if (uitpas.cardSystem.id === cardSystem.id) {
          matchingCardSystem = true;
        }
      });

      return matchingCardSystem;
    },
    isRegisteredInCardSystem: function (cardSystem) {
      var matchingCardSystem = false;

      angular.forEach(this.cardSystems, function (passHolderCardSystem) {
        if (passHolderCardSystem.id === cardSystem.id) {
          matchingCardSystem = true;
        }
      });

      return matchingCardSystem;
    },
    hasUpgrade: function (cardSystem, cardSystemSpecific) {
      var cardSystemId = parseInt(cardSystem.id)
      var hasUpgrade = false;
      angular.forEach(cardSystemSpecific, function (item) {
        if (cardSystemId === item.cardSystem.id && !item.currentCard) {
          hasUpgrade = true;
        }
      });
      return hasUpgrade;
    },
    getPictureSrc: function () {
      return 'data:image/jpeg;base64, ' + this.picture;
    },
    isUnderAge: function () {
      var birthDate = this.birth.date;
      var curDate = new Date();
      var dateDiff = curDate-birthDate;
      var age = Math.floor(dateDiff/31536000000);
      return age < 16 ? true : false;
    }
  };

  return (Passholder);
}
