import mongoose from "mongoose";

const mongdodb_url = process.env.MONGODB_URL;

if(!mongdodb_url){
    throw new Error("db url not found");
}


let cached = global.mongooseConnection
if(!cached){
    cached=global.mongooseConnection={conn:null,promise:null}
}

const connectDb = async ()=>{
if(cached.conn){
    console.log("cached connection returned")
    return cached.conn; // if we have connection then return connection we dont have need to make new same connection
}
 if(cached.promise){
    console.log("Promise connection");
 }

if(!cached.promise){ // if this is a complete new connection then make this connection and store in cached
    console.log("New Connection returned")
    cached.promise = mongoose.connect(mongdodb_url).then(c=>c.connection);

}
try {
    const conn = await cached.promise; // if connection is under progress then we wait for its completion then return connection
    return conn;
} catch (error) {
    console.log(error);
}
}
export default connectDb