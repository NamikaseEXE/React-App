import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Correo electrónico inválido." }, { status: 400 });
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
    }

    // Comparar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Puedes enviar el token como cookie httpOnly o en el body (aquí lo enviamos en el body)
    return NextResponse.json({
      message: "Inicio de sesión exitoso.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error en el servidor." }, { status: 500 });
  }
}