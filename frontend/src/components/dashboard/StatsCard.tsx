import {
 Card,
 CardContent
} from "@/components/ui/card";

export default function StatsCard({
 title,
 value
}:{
 title:string;
 value:string;
}){

 return(
  <Card>
   <CardContent className="p-6">
    <h3 className="text-sm text-gray-500">
      {title}
    </h3>
    <h1 className="text-3xl font-bold">
      {value}
    </h1>
   </CardContent>
  </Card>
 );
}
