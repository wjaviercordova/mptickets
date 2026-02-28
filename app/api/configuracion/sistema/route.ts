import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const negocioId = cookieStore.get("mp_negocio_id")?.value;
    const userId = cookieStore.get("mp_user_id")?.value;

    if (!negocioId || !userId) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    const body = await request.json();
    const { tipo, data } = body;

    if (tipo === "general") {
      // Actualizar configuración general en configuracion_sistema
      const configEntries = Object.entries(data).map(([clave, valor]) => {
        let tipo_dato = "string";
        let valorFinal: string | number | boolean = valor as string | number | boolean;

        if (typeof valor === "number") {
          tipo_dato = "number";
        } else if (typeof valor === "boolean") {
          tipo_dato = "boolean";
          valorFinal = valor.toString();
        } else if (typeof valor === "object") {
          tipo_dato = "json";
          valorFinal = JSON.stringify(valor);
        }

        return {
          negocio_id: negocioId,
          clave,
          valor: valorFinal.toString(),
          tipo: tipo_dato,
          categoria: "general",
        };
      });

      // Primero eliminar las configuraciones anteriores
      await supabase
        .from("configuracion_sistema")
        .delete()
        .eq("negocio_id", negocioId)
        .eq("categoria", "general");

      // Insertar las nuevas
      const { error: configError } = await supabase
        .from("configuracion_sistema")
        .insert(configEntries);

      if (configError) {
        console.error("Error al guardar configuración:", configError);
        return NextResponse.json(
          { message: "Error al guardar configuración" },
          { status: 500 }
        );
      }

      // Registrar en auditoría
      await supabase.from("auditoria").insert({
        negocio_id: negocioId,
        usuario_id: userId,
        accion: "ACTUALIZAR",
        tabla_afectada: "configuracion_sistema",
        descripcion: "Actualización de configuración general del sistema",
        datos_nuevos: data,
      });

      return NextResponse.json({ 
        success: true,
        message: "Configuración guardada exitosamente" 
      });
    }

    if (tipo === "apariencia") {
      // Actualizar configuración de apariencia/tema
      const configEntries = Object.entries(data).map(([clave, valor]) => ({
        negocio_id: negocioId,
        clave,
        valor: typeof valor === "object" ? JSON.stringify(valor) : String(valor),
        tipo: typeof valor === "object" ? "json" : "string",
        categoria: "apariencia",
      }));

      // Eliminar configuraciones anteriores de apariencia
      await supabase
        .from("configuracion_sistema")
        .delete()
        .eq("negocio_id", negocioId)
        .eq("categoria", "apariencia");

      // Insertar las nuevas
      const { error: configError } = await supabase
        .from("configuracion_sistema")
        .insert(configEntries);

      if (configError) {
        console.error("Error al actualizar apariencia:", configError);
        return NextResponse.json(
          { message: "Error al actualizar apariencia" },
          { status: 500 }
        );
      }

      // Registrar en auditoría
      await supabase.from("auditoria").insert({
        negocio_id: negocioId,
        usuario_id: userId,
        accion: "UPDATE",
        tabla_afectada: "configuracion_sistema",
        datos_nuevos: data,
      });

      return NextResponse.json({
        success: true,
        message: "Apariencia actualizada exitosamente",
      });
    }

    if (tipo === "capacidad") {
      // Actualizar configuración de capacidad en configuracion_sistema
      const configEntries = Object.entries(data).map(([clave, valor]) => ({
        negocio_id: negocioId,
        clave,
        valor: String(valor),
        tipo: "number",
        categoria: "capacidad",
      }));

      // Primero eliminar las configuraciones de capacidad anteriores
      await supabase
        .from("configuracion_sistema")
        .delete()
        .eq("negocio_id", negocioId)
        .eq("categoria", "capacidad");

      // Insertar las nuevas
      const { error: configError } = await supabase
        .from("configuracion_sistema")
        .insert(configEntries);

      if (configError) {
        console.error("Error al actualizar capacidad:", configError);
        return NextResponse.json(
          { message: "Error al actualizar capacidad" },
          { status: 500 }
        );
      }

      // Registrar en auditoría
      await supabase.from("auditoria").insert({
        negocio_id: negocioId,
        usuario_id: userId,
        accion: "ACTUALIZAR",
        tabla_afectada: "configuracion_sistema",
        descripcion: "Actualización de capacidad del parqueadero",
        datos_nuevos: data,
      });

      return NextResponse.json({ 
        success: true,
        message: "Capacidad actualizada exitosamente" 
      });
    }

    if (tipo === "impresion") {
      // Actualizar configuración de impresión en configuracion_sistema
      const configEntries = Object.entries(data).map(([clave, valor]) => {
        let tipo_dato = "string";
        let valorFinal: string | number | boolean = valor as string | number | boolean;

        if (typeof valor === "number") {
          tipo_dato = "number";
        } else if (typeof valor === "boolean") {
          tipo_dato = "boolean";
          valorFinal = valor.toString();
        }

        return {
          negocio_id: negocioId,
          clave,
          valor: valorFinal.toString(),
          tipo: tipo_dato,
          categoria: "impresion",
        };
      });

      // Eliminar configuraciones anteriores de impresión
      await supabase
        .from("configuracion_sistema")
        .delete()
        .eq("negocio_id", negocioId)
        .eq("categoria", "impresion");

      // Insertar las nuevas
      const { error: configError } = await supabase
        .from("configuracion_sistema")
        .insert(configEntries);

      if (configError) {
        console.error("Error al actualizar impresión:", configError);
        return NextResponse.json(
          { message: "Error al actualizar configuración de impresión" },
          { status: 500 }
        );
      }

      // Registrar en auditoría
      await supabase.from("auditoria").insert({
        negocio_id: negocioId,
        usuario_id: userId,
        accion: "UPDATE",
        tabla_afectada: "configuracion_sistema",
        descripcion: "Actualización de configuración de impresión",
        datos_nuevos: data,
      });

      return NextResponse.json({
        success: true,
        message: "Configuración de impresión actualizada exitosamente",
      });
    }

    if (tipo === "horarios") {
      // Actualizar configuración de horarios de atención
      const configEntries = Object.entries(data).map(([clave, valor]) => ({
        negocio_id: negocioId,
        clave,
        valor: typeof valor === "object" ? JSON.stringify(valor) : String(valor),
        tipo: "json",
        categoria: "horarios",
      }));

      // Eliminar configuraciones anteriores de horarios
      await supabase
        .from("configuracion_sistema")
        .delete()
        .eq("negocio_id", negocioId)
        .eq("categoria", "horarios");

      // Insertar las nuevas
      const { error: configError } = await supabase
        .from("configuracion_sistema")
        .insert(configEntries);

      if (configError) {
        console.error("Error al actualizar horarios:", configError);
        return NextResponse.json(
          { message: "Error al actualizar horarios de atención" },
          { status: 500 }
        );
      }

      // Registrar en auditoría
      await supabase.from("auditoria").insert({
        negocio_id: negocioId,
        usuario_id: userId,
        accion: "UPDATE",
        tabla_afectada: "configuracion_sistema",
        descripcion: "Actualización de horarios de atención",
        datos_nuevos: data,
      });

      return NextResponse.json({
        success: true,
        message: "Horarios de atención actualizados exitosamente",
      });
    }

    return NextResponse.json(
      { message: "Tipo de configuración no válido" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en API configuracion/sistema:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
