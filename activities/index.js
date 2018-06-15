const uuidv4 = require('uuid/v4');

// See https://github.com/dotnet/corefx/blob/master/src/System.Diagnostics.DiagnosticSource/src/HierarchicalRequestId.md for more info 
// on the hierarchical activity format

class ActivityId {

  constructor(parentId = "") {
      this.sequenceNo_ = 0;
      this.parentId_ = "";

      if (!parentId) {
          this.id_ = this.generateRootId();
      }
      else {
          this.id_ = this.generateParentedId(parentId);
      }
  }

  get id() {
    return this.id_;
  }

  get parentId() {
    return this.parentId_;
  }

  get rootId() {
    const firstDotIndex = this.id_.indexOf('.');
    return this.id_.substring(1, firstDotIndex);
  }

  generateRootId() {
      return `|${uuidv4()}.`;
  }

  generateParentedId(parentId) {
    let sanitizedParentId = parentId[0] === "|" ? parentId : "|" + parentId;

    if (!sanitizedParentId.endsWith(".") && !sanitizedParentId.endsWith("_")) {
        sanitizedParentId += ".";
    }

    return sanitizedParentId + uuidv4().substr(0, 8) + "_";
  }

  getChildId() {
    this.sequenceNo_++;
    return `${this.id_}.${this.sequenceNo_}.`;
  }

  addContextProperties(record) {
    let context = {
      microsoft_traceId: this.rootId,
      microsoft_operationId: this.id_,
      microsoft_operationParentId: this.parentId_
    };

    return Object.assign({}, record, context);
  }
}

exports.ActivityId = ActivityId;
exports.RequestIdHeader = "request-id";
