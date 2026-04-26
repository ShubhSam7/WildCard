import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

async function getUserBalanceFromDatabase(userId: string): Promise<number> {
  // TODO: replace with real query from your DB package.
  // Example shape:
  // const user = await db.user.findUnique({ where: { clerkId: userId }, select: { wildCoins: true } });
  // return user?.wildCoins ?? 0;
  void userId;
  return 1250;
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const wildCoins = await getUserBalanceFromDatabase(userId);

    return NextResponse.json({ wildCoins, userId });
  } catch (error) {
    console.error("Error fetching user balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
