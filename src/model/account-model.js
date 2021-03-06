'use strict';

const _ = require('lodash');
const database = require('../database');
const Sequelize = database.Sequelize;
const sequelize = database.sequelize;

const core = require('../core');
const validator = core.validator;
const ContainerModel = core.ContainerModel;
const Model = core.Model;

const MODEL_ATTRIBUTES = {
  companyName: {field: 'company_name', type: Sequelize.TEXT, allowNull: false, validate: {len: 1}},
  displayName: {field: 'display_name', type: Sequelize.TEXT},
  account_type: {type: Sequelize.STRING},
  social_network_id: {type: Sequelize.UUID},
  prefered_payment_method: {type: Sequelize.STRING},
  prefered_delivery_method: {type: Sequelize.STRING},
  terms: {type: Sequelize.STRING},
  number_of_employees: {type: Sequelize.INTEGER},
  annual_revenue: {type: Sequelize.INTEGER},
  lead_source: {type: Sequelize.STRING},
  lead_rating: {type: Sequelize.INTEGER, defaultValue: 3},
  notes: {type: Sequelize.STRING},
  physical_address_id: {type: Sequelize.UUID},
  shipping_address_id: {type: Sequelize.UUID},
  document: {type: Sequelize.TEXT}
};

class AccountModel extends ContainerModel {
  constructor() {
    super('accounts');
    this.buildModel(MODEL_ATTRIBUTES);
  }

  get contacts() {
    return this.getAssociation("contacts");
  }

  loadContactsByAccountId(id, transaction) {
    return this.contacts.throughModel.findAll({where: {account_id: id}, transaction: transaction}).then((contacts) => {
      return _.map(contacts, (contact) => {
        return {id: contact.contact_id};
      });
    });
  }

  save(account, transaction) {
    return super.save(account, transaction);
  }

  async setContacts(accountId, contacts, transaction) {
    contacts = _.map(contacts, (contactId) => {
      return {account_id: accountId, contact_id: contactId};
    });

    await this.contacts.throughModel.destroy({where: {account_id: accountId}, transaction: transaction});
    await this.contacts.throughModel.bulkCreate(contacts, {transaction: transaction});
  }
}

module.exports = new AccountModel();

