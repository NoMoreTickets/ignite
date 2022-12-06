import ObjectID from "bson-objectid"

class BSONObjectIDGenerator {
  public static generateId(): string {
    const newObjectId = new ObjectID()
    const newObjectIdString = newObjectId.toHexString()
    return newObjectIdString
  }

  public static isValid(hexString: string): boolean {
    const isValid = ObjectID.isValid(hexString)
    return isValid
  }
}

export { BSONObjectIDGenerator }