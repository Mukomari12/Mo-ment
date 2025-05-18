/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

const { getDefaultConfig } = require("@expo/metro-config");
const config = getDefaultConfig(__dirname);
config.transformer.unstable_disableES6Transforms = true;
module.exports = config; 