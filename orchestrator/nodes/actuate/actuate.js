var path = require('path');
var dojot = require('@dojot/flow-node');
var logger = require("../../logger").logger;
var util = require("util");

class DataHandler extends dojot.DataHandlerBase {
  constructor(publisher) {
    super();
    this.publisher = publisher;
  }

  /**
     * Returns full path to html file
     * @return {string} String with the path to the node representation file
     */
  getNodeRepresentationPath() {
    return path.resolve(__dirname, 'actuate.html');
  }

  /**
   * Returns node metadata information
   * This may be used by orchestrator as a liveliness check
   * @return {object} Metadata object
   */
  getMetadata() {
    return {
      'id': 'dojot/actuate',
      'name': 'actuate',
      'module': 'dojot',
      'version': '1.0.0',
    };
  }

  /**
   * Returns object with locale data (for the given locale)
   * @param  {[string]} locale Locale string, such as "en-US"
   * @return {[object]}        Locale settings used by the module
   */
  getLocaleData() {
    return {};
  }

  handleMessage(config, message, callback, metadata) {
    logger.debug("Executing actuate node...");
    if ((config.attrs === undefined) || (config.attrs.length === 0)) {
      logger.debug("... actuate node was not successfully executed.");
      logger.error("Message has no fields to be changed.");
      return callback(new Error('Invalid data source: field is mandatory'));
    }

    try {
      let output = {
        meta: {
          deviceid: config._device_id,
          service: metadata.tenant
        },
        metadata: {
          tenant: metadata.tenant
        },
        event: 'configure',
        data: {
          attrs: this._get(config.attrs, message),
          id: config._device_id
        }
      };
      logger.debug(`Sending message... `);
      logger.debug(`Message is: ${util.inspect(output, { depth: null })}`);
      this.publisher.publish(output);
      logger.debug(`... message was sent.`);
      logger.debug("... actuate node was successfully executed.");
      return callback();
    } catch (error) {
      logger.debug("... actuate node was not successfully executed.");
      logger.error(`Error while executing actuate node: ${error}`);
      return callback(error);
    }
  }
}

module.exports = {Handler: DataHandler};