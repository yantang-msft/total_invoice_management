const uuidv4 = require('uuid/v4');

// See https://github.com/dotnet/corefx/blob/master/src/System.Diagnostics.DiagnosticSource/src/HierarchicalRequestId.md for more info 
// on the hierarchical activity format

export class ActivityId {

  constructor(parent_id = "") {
      this.sequenceNo_ = 0

      if (!parent_id) {
          this.id_ = generateRootId();
          this.parent_id_ = "";
      }
      else {
          this.parent_id_ = parent_id;
          this.id_ = generateParentedId(parent_id);
      }
  }

  generateRootId() {
      return `|${uuidv4()}.`;
  }

  generateParentedId(parent_id) {
    sanitizedParentId = parent_id[0] === "|" ? parent_id : "|" + parent_id;

    if (!sanitizedParentId.endsWith(".") && !sanitizedParentId.endsWith("_")) {
        sanitizedParentId += ".";
    }

    return sanitizedParentId + uuidv4().substr(0, 8) + "_";
  }
}
