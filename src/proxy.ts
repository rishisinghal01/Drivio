import { NextRequest, NextResponse } from "next/server"
import { auth } from "./auth"
import path from "path"

const Public_routes = ["/"]

export async function proxy(req:NextRequest) {
    const {pathname} = req.nextUrl
    if(pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(pathname)
    ){
        return NextResponse.next()

    }
    if(Public_routes.includes(pathname)){
        return NextResponse.next();
    }
    if(pathname.startsWith("/api/auth")){
        return NextResponse.next();
    }

    const session = await auth();
    if(!session){
        return NextResponse.redirect(new URL("/",req.url))
    }


    const role = session.user?.role;
    if(pathname.startsWith("/admin")){
       if(role !="admin"){
               return NextResponse.redirect(new URL("/",req.url))

       }

    }

    if(pathname.startsWith("/partner")){
        if(pathname.startsWith("/partner/onboarding")){
            return NextResponse.next();
        }
       if(role !="partner"){
               return NextResponse.redirect(new URL("/",req.url))

       }
    }

    if(pathname.startsWith("/api")){
        if(!session ||!session.user){
            return  NextResponse.json({
                message:"Unauthorized"
            },{status:401})
        }
    }



    return  NextResponse.next()



     

}



export const config ={

    matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]
    

}
