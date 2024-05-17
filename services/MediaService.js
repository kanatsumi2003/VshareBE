"use strict";

const db = require("../models");
const AbstractBaseService = require("./AbstractBaseService");

class MediaService extends AbstractBaseService {
  constructor() {
    super(db.media);
  }

  saveMedia = async (targetId, files, type, tableName, options) => {
    await db.media.destroy({
      where: {
        target_table: tableName,
        target_id: targetId,
        target_type: type,
      },
      ...options,
    });
    const bulkData = [];
    for (const [fieldKey, value] of Object.entries(files)) {
      if (typeof value === "string") {
        bulkData.push({
          target_table: tableName,
          target_id: targetId,
          target_type: type,
          media_name: fieldKey,
          media_type: "",
          path: value.trim(),
        })
      } else if (Array.isArray(value)) {
        for (const src of value) {
          bulkData.push({
            target_table: tableName,
            target_id: targetId,
            target_type: type,
            media_name: fieldKey,
            media_type: "",
            path: src ? src.trim() : "",
          })
        }
      }
    }
    if (bulkData.length) {
      await db.media.bulkCreate(bulkData, { ...options })
    }
  };
}

module.exports = new MediaService();
