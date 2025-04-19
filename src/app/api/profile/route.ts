import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!;

function getUserFromRequest(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; email: string; name: string };
    return payload;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }
  return NextResponse.json({ user: { id: dbUser.id, name: dbUser.name, email: dbUser.email } });
}

export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { name, email, password } = await req.json();
  if (!name || !email) {
    return NextResponse.json({ error: "Nombre y correo son obligatorios." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Correo electrónico inválido." }, { status: 400 });
  }
  let updateData: any = { name, email };
  if (password && password.length >= 6) {
    updateData.password = await bcrypt.hash(password, 10);
  }
  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
    return NextResponse.json({ user: { id: updated.id, name: updated.name, email: updated.email } });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "El correo ya está en uso." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al actualizar el perfil." }, { status: 500 });
  }
}
