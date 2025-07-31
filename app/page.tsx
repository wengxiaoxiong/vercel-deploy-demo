'use client'

import Image from "next/image";
import { MultiImageUpload } from "./components/MultiImageUpload";
import { useState } from "react";

export default function Home() {

  const [urls,setUrls] = useState<string[]>();
  
  return (
    <div>
      <MultiImageUpload onChange={(urls:string[])=>{setUrls(urls)}} />
        <div>
          {urls && urls.map((item,index)=>{
            return <div key={index}>{item}</div>
          })}
        </div>
    </div>

  );
}
