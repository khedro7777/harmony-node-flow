import clientPromise from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { broadcast } from "@/integrations/web-socket";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db("dao");

  switch (req.method) {
    case "POST":
      try {
        const newDispute = req.body;
        const result = await db.collection("cases").insertOne(newDispute);
        broadcast({ type: "dispute-created" });
        res.status(201).json({ message: "Dispute created successfully", disputeId: result.insertedId });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating dispute" });
      }
      break;
    case "GET":
      try {
        const disputes = await db.collection("cases").find({}).toArray();
        res.status(200).json(disputes);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching disputes" });
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}
