<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('areas', function (Blueprint $t) {
            $t->id();
            $t->string('nombre', 50);
        });

        Schema::create('contextos', function (Blueprint $t) {
            $t->id();
            $t->string('nombre', 40);
        });

        Schema::create('tipo_evento', function (Blueprint $t) {
            $t->id();
            $t->string('nombre', 60);
            $t->string('color', 20)->nullable();           // UI: ColorPicker (manual o auto con contraste)
            $t->unique('nombre');
        });

        Schema::create('personas', function (Blueprint $t) {
            $t->id();
            $t->string('nombre', 120);
            /* Qué es: Nombre completo.
                 UI: Text con búsqueda; avatar con iniciales. Mostrar en listas y detalles. 
                 Tip: Validar que no esté vacío; autocompletar en pickers.*/
            $t->enum('relacion', ['familiar', 'amigo', 'colaborador', 'cliente', 'otro'])->nullable();
            /* Qué es: Tipo de relación.
                 UI: ChipGroup con colores (Fam=verde, Amigo=azul, Colab=naranja, Cliente=rojo, Otro=gris).
                 Tip: Úsalo como filtro en listas y para segmentar delegación. */
            $t->string('email', 200)->nullable();
            /** Qué es: Email de contacto.
             * UI: Input de email; icono de “mailto”.
             * Tip: Validar formato y permitir vacío (familia puede no tenerlo). */
            $t->string('telefono', 40)->nullable();
            /** Qué es: Teléfono de contacto.
             * UI: Input de teléfono; icono de “llamar”.
             * Tip: Guardar limpio (+52...) para integraciones futuras. */
            $t->boolean('activo')->default(true);
            /** Qué es: Si la persona está activa o inactiva.
             * UI: Toggle ON/OFF; ocultar inactivos por defecto en pickers ; si inactiva, mostrar en gris y mover a fondo de listas.
             * Tip: Ocultar en pickers si inactiva, salvo que se busque explícitamente. */
            $t->longText('notas')->nullable();
            /** Qué es: Notas adicionales (contexto, detalles, preferencia).
             * UI: Textarea; mostrar preview en card.
             * Tip: Usar para guardar contexto o links relacionados. */
            $t->date('cumpleanos')->nullable();
            /** Qué es: Fecha de cumpleaños.
             * UI: Date picker; mostrar badge 🎂 en el día.
             * Tip: Usar para recordatorios anuales. */
            /* Campos de delegación (baseline) */
            $t->unsignedTinyInteger('skill')->default(5);
            /** Qué es: Habilidad general (0–10).
             * UI: Slider con gradiente (rojo→amarillo→verde).
             * Tip: Ajusta en 1:1 semanales; base para recomendaciones. */

            $t->unsignedTinyInteger('will')->default(5);
            /** Qué es: Voluntad/motivación general (0–10).
             * UI: Slider con iconos (😴 / 🙂 / 🚀).
             * Tip: Úsalo junto a Skill para sugerir nivel de delegación. */

            $t->unsignedTinyInteger('delegation_level')->default(3);
            /** Qué es: Nivel base de delegación (1–5).
             * UI: Chips 1..5 con tooltip:
             *   1=Haz exactamente lo que digo
             *   2=Haz y actualízame
             *   3=Investiga y recomienda
             *   4=Decide y reporta
             *   5=Autonomía total
             * Tip: Las tareas nuevas heredan este nivel salvo override. */

            $t->decimal('ranking', 5, 2)->nullable();
            /** Qué es: Ranking interno (cache).
             * UI: Badge con medalla 🥇🥈🥉 en top 3.
             * Tip: Derivado de Skill, Will, interacción (tareas asignadas, completadas, feedback). */

            $t->timestamp('last_review_at')->nullable();
            /** Qué es: Última revisión de Skill/Will.
             * UI: Badge “hace X días”.
             * Tip: Mostrar recordatorio si >14 días sin revisión. */
        });

        Schema::create('proyectos', function (Blueprint $t) {
            $t->id();
            /**Qué es: Identificador único.
                 UI: oculto; usar como key/route param y para enlaces (detalle, Gantt).
                 Tip: Copiar al portapapeles desde el modal (debug/support). */
            $t->string('nombre', 200);
            /** Qué es: Nombre del proyecto.
             * UI: Text input prominente; inline editable.
             * Tip: Validar que no venga vacío; mostrar contador (200). */
            $t->string('descripcion', 400)->nullable();
            /** Qué es: Descripción corta (resumen).
             * UI: Textarea breve / subheading en card.
             * Tip: Cortar con ellipsis en listas. */
            $t->foreignId('area_id')->nullable()->constrained('areas')->nullOnDelete();
            /** Qué es: Área/responsabilidad (Empresa, Ventas, Personal…).
             * UI: Select/Autocomplete con color de área.
             * Tip: Filtro por área en dashboard.
             */
            $t->enum('status', ['abierto', 'cerrado'])->default('abierto');
            /** Qué es: Estado operativo del proyecto.
             * UI: Chip/Toggle (Abierto/Cerrado).
             * Tip: Si pasa a “cerrado”, desactivar edición de fechas real. */
            $t->enum('prioridad', ['baja', 'media', 'alta'])->default('media');
            /** Qué es: Prioridad del proyecto para ordenar listas.
             * UI: ChipGroup (baja/med/alta) con colores.
             * Tip: Orden secundario tras “estratégico”. */
            $t->boolean('estrategico')->default(false); // ← para destacarlos
            /** Qué es: Marcador para destacar proyectos clave.
             * UI: Badge ⭐ “Estratégico” y orden al tope.
             * Tip: Filtro rápido “solo estratégicos”. */

            //Fechas del cronograma (Gantt):
            $t->date('fec_inicio_plan')->nullable();
            $t->date('fec_fin_plan')->nullable();
            /** Qué es: Rango planificado.
             *  UI: Date pickers; validación fin ≥ inicio.
             *  Tip: Si ambos existen, dibuja barra “plan” en Gantt.*/
            $t->date('fec_inicio_real')->nullable();
            $t->date('fec_fin_real')->nullable();
            /**  Qué es: Rango real de ejecución.
             * UI: Date pickers; fin_real se setea al cerrar.
             * Tip: Mostrar barra “real” (superpuesta) en Gantt.*/

            //Objetivos (modo simple + tabla)
            $t->enum('criterio_cierre', ['tareas', 'objetivos'])->default('tareas');
            /** Qué es: Regla de cierre del proyecto.
             * UI: Radio (Tareas / Objetivos).
             * Tip: Si “objetivos”, mostrar checklist de objetivos en la ficha.
             */
            $t->string('objetivo_principal', 300)->nullable(); //si quieres un objetivo único rápido
            /** Qué es: Objetivo clave (resumen).
             * UI: Text input prominente; mostrar como “meta” encima de la lista.
             * Tip: Mostrar en header y listas (cursiva). No sustituye a la tabla de objetivos, es opcional.  */

            // Próxima acción
            $t->unsignedBigInteger('proxima_accion_tarea_id')->nullable();
            /** Qué es: Tarea marcada como “próxima acción” del proyecto.
             * UI: Link clickable; botón “Ir a tarea / Iniciar Pomodoro”.*/
            $t->enum('proxima_accion_modo', ['auto', 'manual'])->default('auto');
            /* Qué es: Cómo se define la próxima acción.
                 UI: Toggle Auto/Manual con tooltip; si Manual, mostrar selector de tarea.
                 Tip: Cuando completes esa tarea y no elijas otra, volver a Auto. */
            $t->timestamp('proxima_accion_updated_at')->nullable();
            /** Qué es: Última vez que se actualizó la próxima acción.
             * UI: Tooltip “Actualizado hace X” en hover.
             * Tip: Usar para cálculo de antigüedad/decay (derivado). */

            $t->foreignId('owner_id')->nullable()->constrained('personas')->nullOnDelete();
            /** Qué es: Responsable principal del proyecto.
             * UI: Autocomplete con avatar.
             * Tip: Las tareas nuevas pueden heredar este owner por defecto. */

            $t->unsignedTinyInteger('delegation_level_applied')->default(3);
            /** Qué es: Nivel de delegación del proyecto (1–5).
             * UI: Chips 1..5 (mismo set que tareas).
             * Tip: Las tareas creadas dentro del proyecto heredan este nivel salvo cambio. */

            $t->unsignedSmallInteger('interest_hits')->default(0);
            /** Qué es: Interés acumulado del proyecto.
             * UI: Contador [+]/[–] en header del proyecto.
             * Tip: Puede distribuir un pequeño boost a sus tareas. */

            $t->timestamp('interest_last_at')->nullable();
            /** Qué es: Última vez con interés.
             * UI: Badge relativo.
             * Tip: Mostrar en dashboard para priorizar follow-up. */

            $t->decimal('progreso_pct', 5, 2)->nullable();
            /** Qué es: Progreso % (0–100) del proyecto (cache).
             * UI: Progress bar; si null, ocultar. Barra de progreso en header y listas.
             * Tip: Si usas etapas, calcular como promedio ponderado por etapa. Se puede calcular por tareas o por pomodoros. */
            $t->longText('notas_md')->nullable();
            /** Qué es: Notas internas en Markdown (detalles, links, contexto).
             * UI: Editor MD compacto con preview; soporte de adjuntos/links. útil para acuerdos, decisiones.
             * Tip: Snippets: “Contexto”, “Stakeholders”, “Riesgos”. */
            $t->timestamps();
            /* Qué es: created_at / updated_at.
                 UI: Mostrar “Creado hace X” en tooltip / footer. */

            $t->index(['interest_hits', 'status'], 'ix_proyecto_interes_status');
            $t->index('interest_last_at', 'ix_proyecto_interes_last');
        });

        Schema::create('proyecto_etapas', function (Blueprint $t) {
            $t->id(); // UI: oculto; usar como key.
            $t->foreignId('proyecto_id')->constrained('proyectos')->cascadeOnDelete(); // Planificación, Desarrollo, PRuebas, Entrega
            // UI: implícito en la vista del proyecto.
            $t->string('nombre', 120);
            /** Qué es: Nombre de la etapa (Planificación, Desarrollo, QA, Entrega).
             * UI: Text input; en Gantt como etiqueta de barra. */
            $t->integer('orden');
            /** Qué es: Orden visible en listas y Gantt de la etapa dentro del proyecto.
             * UI: Drag & drop para reordenar; persistir.
             * Tip: Mostrar como kanban lane en vista de proyecto. */
            $t->date('fecha_inicio_plan')->nullable();
            $t->date('fecha_fin_plan')->nullable();
            /*  Qué es: Rango planificado de la etapa.
                 UI: Date pickers; barra “plan” en Gantt. */
            $t->date('fecha_inicio_real')->nullable();
            $t->date('fecha_fin_real')->nullable();
            /** Qué es: Rango real.
             * UI: Se setea inicio_real al pasar a “en ejecución”; fin_real al marcar “done”. */
            $t->decimal('progreso_pct', 5, 2)->nullable();
            /** Qué es: Progreso % (0–100) de la etapa (cache).
             * UI: Progress bar fina dentro de la barra Gantt.; si null, ocultar. Barra de progreso en header y listas.
             * Tip: Calcular como promedio ponderado por tareas o pomodoros. */
            $t->boolean('done')->default(false);
            /** Qué es: Marca si la etapa está completa.
             * UI: Checkbox; al marcar, setear fecha_fin_real a hoy.
             * Tip: Al completar la última etapa, marcar el proyecto como cerrado. */
            $t->timestamps();
        });

        Schema::create('proyecto_objetivos', function (Blueprint $t) {
            $t->id(); // UI: oculto.
            $t->foreignId('proyecto_id')->constrained('proyectos')->cascadeOnDelete(); // UI: implícito por contexto.
            $t->string('descripcion', 300);
            /** Qué es: Objetivo claro y medible (sin KPI).
             * UI: Text input; en ficha como checklist. */
            $t->date('fecha_objetivo')->nullable();
            /** Qué es: Fecha deseada para cumplirlo.
             * UI: Date picker; badge D-xx. */
            $t->boolean('cumplido')->default(false);
            /** Qué es: Estado del objetivo.
             * UI: Checkbox; tachar cuando true. */
            $t->smallInteger('orden');
            /**  Qué es: Orden en la lista. 
             * UI: Drag & drop; persistir. */
            $t->timestamps();
        });

        Schema::create('tareas', function (Blueprint $t) {
            $t->id();
            /**Qué es: Identificador único.
                 UI: oculto; úsalo en rutas/keys.
                 Tip: Copiar al portapapeles desde el modal (debug/support). */

            $t->foreignId('proyecto_id')->nullable()->constrained('proyectos')->nullOnDelete();
            /**Qué es: A qué proyecto/épica pertenece.
                UI: Autocomplete/Select con búsqueda; mostrar avatar/color del proyecto.
                Tip: Permite “crear proyecto rápido” desde el dropdown. */

            $t->foreignId('proyecto_etapa_id')->nullable()->constrained('proyecto_etapas')->nullOnDelete();
            /**
             * Qué es: Fase dentro del proyecto (p.ej., Descubrimiento → Construcción → QA → Entrega).
             * UI: Select con chips de colores.
             * Tip: Mostrar como kanban lane en vista de proyecto.
             */

            $t->string('titulo', 300);
            /**Qué es: Nombre de la tarea.
                 UI: Textbox inline editable con atajos (Enter = guardar).
                 Tip: Prefijo rápido con [] → crea checklist en detalle_md. 
                 UX rule: valida en front que titulo empiece con verbo.
                 
             */
            $t->longText('detalle_md')->nullable();
            /**
             * Qué es: Descripción en Markdown.
             * UI: Editor MD compacto con preview; soporte de adjuntos/links.
             * Tip: Snippets: “Criterio de listo”, “Contexto”, “Riesgos”.
             */

            $t->enum('estado', ['backlog', 'siguiente', 'hoy', 'en_curso', 'en_revision', 'hecha', 'bloqueada'])->default('backlog');
            /**
             * Qué es: Pipeline de ejecución.
             * UI: Select + arrastrar en tablero kanban.
             * Tip: Resaltar bloqueada con borde rojo y chip “Waiting For”.
             */

            $t->dateTime('fecha')->default(now()); // Fecha en que fue pedido
            /**
             * Qué es: Fecha de creación (automática), se puede cambiar.
             * UI: Mostrar en detalle (editable).
             * Tip: Usar para calcular antigüedad (D-X) en listas.
             */
            $t->dateTime('fecha_limite')->nullable();
            /**
             * Qué es: Due date (opcional).
             * UI: Date picker con badges (Hoy, Mañana, Vencido).
             * Tip: Mostrar contador D-X y color semáforo.
             */
            $t->date('seguimiento_proximo')->nullable();
            /**Qué es: Próximo ping/recordatorio de seguimiento (delegados/esperas).
                 UI: Date picker con botón “+7d” rápido.
                 Tip: Lista “Waiting For” ordenada por este campo. */

            $t->foreignId('responsable_id')->nullable()->constrained('personas')->nullOnDelete();
            /**Qué es: A quién está asignada.
                UI: Avatar + Assignee picker.
                Tip: Acciones rápidas: “Reasignar a Empleado 1/2/3”. */

            // Clasificación
            $t->enum('tipo', ['tarea', 'bug', 'mejora', 'investigacion', 'consumo'])->default('tarea');
            /**
             * Qué es: Naturaleza de la tarea.
             * UI: Icono/chip (🐛 bug, 🔬 investigación).
             * Tip: Filtro por tipo en listas.
             */
            $t->foreignId('area_id')->nullable()->constrained('areas');
            /**
             * Qué es: Área (Empresa, Personal, Ventas, Finanzas…).
             * UI: Chips por área; color consistente en todo el app.
             * Tip: Vista “por área” para balance vida/trabajo.
             */
            // $t->enum('contexto', ['casa', 'oficina', 'ordenador', 'telefono', 'internet', 'errands', 'reuniones'])->nullable(); // Las errands son recados fuera de casa/oficina
            $t->foreignId('contexto_id')->nullable()->constrained('contextos');
            /**
             * Qué es: Contexto de ejecución (PC, Teléfono, Casa, Oficina).
             * UI: Iconos (💻 📱 🏠 🏢).
             * Tip: Sugerir tareas “de teléfono” cuando estés fuera del escritorio.
             */


            // Metodologías
            $t->enum('moscow', ['M', 'S', 'C', 'W'])->nullable();
            /**
             * Qué es: Prioridad de ciclo (Must/Should/Could/Won’t).
             * UI: Chips M/S/C/W con tooltip.
             * Tip: Presupuesto semanal por bucket (progreso visual).
             */
            $t->enum('horizon', ['H1', 'H2', 'H3'])->nullable(); // Horizonte 1/2/3
            /**
             * Qué es: Horizonte temporal (corto/medio/largo).
             * UI: Chip H1/H2/H3; mostrar en vista estratégica.
             * Tip: Indicador de equilibrio (horas H1 vs H2/H3).
             */
            $t->boolean('eisen_importante')->default(false);
            $t->boolean('eisen_urgente')->default(false);
            /**
             * Qué es: Flags para Eisenhower.
             * UI: Toggle dual (🔥 urgente / 🎯 importante) → muestra Q1/Q2/Q3/Q4.
             * Tip: Autocalcular urgencia con due date, editable manual.
             */
            /**
             * Cuadrante 1 (Urgente + Importante): Score 90-100
             * Cuadrante 2 (Importante, No Urgente): Score 70-89
             * Cuadrante 3 (Urgente, No Importante): Score 30-69
             * Cuadrante 4 (Ni Urgente ni Importante): Score 0-29
             * 
             * aplica Eisenhower Q3 (urgente no importante).

             * En vista de delegación: botón “delegar rápido”.
             
             * Fórmula: (Importancia × 0.6) + (Urgencia × 0.4)
             */

            // MCDA inputs (0–10)
            $t->unsignedTinyInteger('impacto')->nullable(); // 0-10 //Impacto Estratégico: 30% (contribución a objetivos H2/H3 y KPI críticos.)
            $t->unsignedTinyInteger('valor')->nullable(); // 0-10 //Valor de Negocio: 25% (ROI proyectado)
            $t->unsignedTinyInteger('eficiencia')->nullable(); // 0-10 //Eficiencia Operativa (Recursos): 15% (ahorro de costes o tiempo) (esfuerzo requerido)  menos esfuerzo = puntaje mayor (invierte esfuerzo a 0–10).
            $t->unsignedTinyInteger('stakeholders')->nullable(); // 0-10 Alineación con Stakeholders: 10% (apoyo equipo/board) (apoyo equipo/board/cliente.)
            // urgencia: derivada de fecha_limite; si quieres override manual:
            $t->unsignedTinyInteger('urgencia_manual')->nullable(); // opcional //Urgencia Temporal: 20% (días hasta deadline) (mapea “días a vencimiento” a 0–10 (más cerca, más alto).)
            //Decaimiento temporal: Tareas antiguas pierden 3% de prioridad por día
            /**
             * Qué es: Criterios MCDA (sliders).
             * UI: Slider 0–10 con color.
             * Tip: Mostrar MCDA calculado en vivo como “barra de valor”.
             */

            // KASH / Family / Rock / Frog
            $t->enum('kash', ['K', 'A', 'S', 'H'])->nullable(); // KASH (tu marco): si refuerza Skills/Habits críticos de tu mes ⇒ +10%.
            /**
             * Qué es: Enfoque de crecimiento (Conocimiento/Actitud/Skill/Hábito).
             * UI: Chips con tooltip.
             * Tip: Badge “+10%” si S/H según tu regla.
             */
            $t->boolean('family_friendly')->default(false); //Bonus de alineación familiar: +25% para tareas que se pueden hacer en horarios flexibles
            /**
             * Qué es: Se puede hacer con familia alrededor/horario flexible.
             * UI: Icono 👨‍👩‍👧‍👦 en la tarjeta.
             * Tip: Filtro “aptas con niñas” para tardes.
             */
            $t->boolean('is_rock')->default(false);
            /**
             * Qué es: Es Roca de la semana.
             * UI: Estrella ⭐ fija arriba del card.
             * Tip: Vista “Plan semanal” con 3 rocas al tope.
             */
            $t->boolean('frog')->default(false);
            $t->date('frog_date')->nullable();
            /**
             * Qué es: Rana del día.
             * UI: Badge 🐸 grande + primer ítem en “Hoy”.
             * Tip: Si no cabe hoy (ver timeblocking), sugerir mover.
             */

            // Pomodoros / tiempo
            $t->unsignedTinyInteger('pomos_estimados')->nullable();   // permite 255
            /**≤1 pomo → micro. 
             **2–3 pomos → normal.
             **≥4 pomos → proyecto. */
            /**
             * Puedes inferirlo de pomos_estimados:
             * ≤1 pomo → micro (2–25 min) → mostrar rayo ⚡
             * 2–4 pomos → normal
             * ≥5 pomos → proyecto → sugerir “convertir en proyecto / crear subtareas”
             * */
            $t->unsignedTinyInteger('pomos_realizados')->default(0);
            /**
             * Qué es: Estimación y progreso (25’ c/u).
             * UI: Contador con círculos rellenándose.
             * Tip: Mostrar ETA (pomos restantes × 25’); sugerir re-estimación al superar ±30%.
             */
            $t->unsignedInteger('tiempo_total_min')->default(0);
            /**
             * Qué es: Minutos acumulados (tracking).
             * UI: Pequeño ⏱ debajo del título.
             * Tip: Mostrar “Tiempo real vs estimado”.
             */
            // Score y control de orden
            $t->decimal('score', 9, 4)->default(0);    // cache opcional del score final
            /**
             * Qué es: Cache de tu ScoreFinal (orden automático).
             * UI: Mostrar como número/chip (y barra de color).
             * Tip: Recalcular tras cambios clave; cron nocturno.
             */
            $t->integer('ranking')->default(1000);     // empuje manual espaciado
            /**
             * Qué es: Orden manual (1000, 2000…) para empujar.
             * UI: Drag & drop en lista; “Enviar al tope” = rank min − 100.
             * Tip: Rebalance nocturno a múltiplos de 100.
             */
            $t->boolean('pareto')->default(false);     // top 20% de valor dentro del proyecto
            /**
             * Qué es: Marca si es del top 20% del proyecto.
             * UI: Chip 20% ⚡.
             * Tip: Bonus visual y en score.
             */
            $t->boolean('bloqueada')->default(false);
            $t->string('bloqueo_motivo', 300)->nullable();
            /**
             * Qué es: No puede avanzar; razón.
             * UI: Estado rojo + botón “Solicitar insumo” / “Ping”.
             * Tip: Mover a lista “Waiting For”; ocultar de “Hoy” por defecto.
             */

            // Boost temporal 24h
            $t->dateTime('score_boost_until')->nullable();
            $t->decimal('score_boost_factor', 5, 2)->nullable(); // ej. 1.15
            /**
             * Qué es: Boost 24h (“más urgente”).
             * UI: Botón “Más urgente (24h)” con countdown chip.
             * Tip: Cap de 3 boosts activos; no stackear factores.
             */


            // Ajuste riesgo-oportunidad (-0.20 .. +0.20)
            $t->decimal('riesgo_oportunidad', 4, 2)->nullable();
            /**
             * Qué es: Ajuste fino manual.
             * UI: Mini slider ±20%.
             * Tip: Mostrar ícono ⚠️ si <0, 💡 si >0.
             */

            // Relaciones adicionales
            $t->unsignedBigInteger('habito_id')->nullable();
            /*  Qué es: Relación con un hábito (si refuerza rutina).
                UI: Link a hábito (streak visible).
                Tip: Bonus de score si H.*/

            $t->enum('dificultad', ['trivial/mecánico', 'requiere_pensar_leer_investigar', 'muy_exigente'])->nullable();
            /**  Qué es: Ayuda a programar con Deep Work:
             * Pon las tareas 4–5 en tus bloques de foco de la mañana.
             * Tareas 1–2 para las tardes, cuando la energía baja.
             * No tiene que entrar en el Score, sino en la agenda de Time Blocking.
             * UI: Select con iconos (🟢🟡🔴).
             * Tip: Usar para sugerir tareas según momento del día. */
            $t->boolean('kaizen')->default(false); //Define un Kaizen diario (1 tarea chiquita de mejora al sistema, al proceso, o incluso en tu vida). Lo puedes trackear como hábito.
            /** Qué es: Define un Kaizen diario (1 tarea chiquita de mejora al sistema, al proceso, o incluso en tu vida). Lo puedes trackear como hábito.
             * UI: Icono 🛠️ en la tarjeta
             * Tip: Bonus de score si es Kaizen. */

            $t->unsignedTinyInteger('delegation_level_rec')->nullable();
            /** Qué es: Nivel de delegación recomendado (auto).
             * UI: Badge “Recomendado: N”.
             * Tip: Calculado con Skill/Will (baseline u override) + tipo de tarea. */

            $t->unsignedTinyInteger('delegation_level_applied')->nullable();
            /** Qué es: Nivel aplicado (manual/confirmado).
             * UI: ChipGroup 1..5; botón “Aplicar recomendado”.
             * Tip: Permite override rápido por criterio del gestor. */

            $t->unsignedTinyInteger('skill_override')->nullable();
            $t->unsignedTinyInteger('will_override')->nullable();
            /** Qué es: Overrides 0–10 específicos para ESTA tarea.
             * UI: Mini sliders opcionales (ocultos por defecto).
             * Tip: Úsalos cuando la tarea requiera/permita algo distinto del baseline. */

            $t->date('sla_fecha')->nullable();
            /** Qué es: Compromiso/fecha de entrega (SLA).
             * UI: DatePicker con presets (+1d, +3d, +1w).
             * Tip: Semáforo: rojo vencido, ámbar ≤2 días, verde OK. */

            $t->timestamp('ultimo_movimiento_at')->nullable();
            /** Qué es: Última actividad (estado, comentario, archivo).
             * UI: Badge “sin cambios hace X días”.
             * Tip: Disparar sugerencia de “ping” si > N días (ej. 3). */

            $t->boolean('escalado')->default(false);
            /** Qué es: Marcador de escalamiento.
             * UI: Toggle + banner en detalle.
             * Tip: Al escalar, optionally bajar nivel aplicado (ej. 4→2) y notificar. */

            $t->unsignedSmallInteger('interest_hits')->default(0);
            /** Qué es: Veces que preguntaron por esta tarea (interés externo).
             * UI: Contador con botones [+] y [–] en la tarjeta.
             * Tip: Mostrar quién preguntó (en comentarios) si quieres trazabilidad. */

            $t->timestamp('interest_last_at')->nullable();
            /** Qué es: Última vez que se registró interés.
             * UI: Badge “preguntaron hace X días”.
             * Tip: Útil para SLA social. */

            /*UI para el contador
                En tarjeta: “👀 Interés: 3” + botones [ + ] [ – ]
                Acción rápida: “Registrar pregunta de cliente” → incrementa interest_hits, marca interest_last_at = now() y deja un comentario automático (quién, si lo capturas).*/

            $t->timestamps();
            /** Qué es: Fechas del sistema.
             * UI: Mostrar “Hace X días” en hover.
             * Tip: Usar para cálculo de antigüedad/decay (derivado). */
            $t->softDeletes();
            /** Qué es: Borrado lógico.
             * UI: Vista “Papelera” para recuperar.
             * Tip: Borrado físico tras 30 días. Filtro “incluye archivadas” en búsquedas. */

            // Índices útiles (corrigiendo nombres)
            $t->index(['estado', 'ranking'], 'ix_tarea_estado_rank');
            $t->index(['score', 'fecha_limite'], 'ix_tarea_score_due');
            $t->index('proyecto_id', 'ix_tarea_proyecto');
            $t->index(['responsable_id', 'estado'], 'ix_tarea_responsable_estado');
            $t->index(['interest_hits', 'score'], 'ix_tarea_interes_score');
            $t->index('interest_last_at', 'ix_tarea_interes_last');

            /*Campos Derivados (no guardar, calcular para la UI)
                Útiles en frontend como badges o columnas calculadas. No hace falta persistirlos.

                MCDA = 0.30impacto + 0.25valor + 0.20urgencia(derivada) + 0.15eficiencia + 0.10*stakeholders
                  --UI: Barra de “valor esperado” junto al título.

                EisenhowerScore (0–10) y Quadrant (Q1/Q2/Q3/Q4)
                  --UI: Chip de cuadrante; color por Q.

               StratMult / FamilyMult / KASHMult / Decay / ScoreAuto
                  --UI: No mostrar todos; solo Score final y chips (Rock, Frog, Pareto, Boost, Bloqueada).

              DaysSinceCreated
                  --UI: Tooltip “Antigüedad: X días”.*/


            /**Validaciones / UX rápidas
                        Sliders 0–10: pasos de 1; color heatmap.
                        Booleans: toggles/chips con iconos.
                        Selects: buscar + crear en línea (proyecto, etapa, área).
                        Atajos: ↑↓ para reordenar; F marcar Frog; R marcar Rock.
                        Empty state “Hoy” → sugerir 1 Frog + 2 Rocas que sí caben en el día (ver abajo).
             */

            /**Encaje con Time Blocking (lo que pedías)

                Muestra capacidad disponible del día y costo estimado de las seleccionadas:
                    - Capacidad día = suma de bloques “disponibles” (deep_work/admin) en minutos.
                    - Costo selección = Σ(pomos_estimados × 25).
                    - Semáforo en “Confirmar Hoy”:
                        --🟢 Cabe (capacidad ≥ costo).
                        --🟡 Justo (capacidad − costo < 15’).
                        --🔴 No cabe (falta X min) → sugerir: mover Frog, dividir tarea (sub-tareas), o pasar a mañana.

                UI Tip: Banner en “Hoy” con restante: “Te quedan 65 min de foco”. */

            /** Ejemplo de tarjeta (card) compacta:

             *-- Línea 1: 🐸/⭐ Título + chips (M/S/C/W, Q1–Q4, H1–H3, 👨‍👩‍👧‍👦, ⚡20%)
             *-- Línea 2: ETA (3×25’) • Due D-2 • Assignee • Score 12.8
             *-- Footer: Progress (●●○○) • Estado (En curso) • Boost 12h  */

            /**Sugerir batching automático (“Tienes 3 llamadas → agrúpalas”). */

            /**UI/UX rápido
                Botón “Más urgente (24 h)” con badge de cuenta regresiva (ej. “12 h”).
                Tooltip: “Empuja la tarea por 24 h sin cambiar due date ni rank”.
                Lista “Hoy” muestra un chip Boost 24h.*/
        });

        DB::statement('ALTER TABLE proyectos ADD CONSTRAINT fk_proxima_accion_tarea FOREIGN KEY (proxima_accion_tarea_id) REFERENCES tareas(id) ON DELETE SET NULL');

        Schema::create('habitos', function (Blueprint $t) {
            $t->id();
            /** Qué es: ID único.
             *  UI: oculto (keys/URLs).
             *  Tip: úsalo para deep-links. */
            $t->string('nombre', 120);                           // UI: Text; verbo al inicio (Leer, Correr).
            /** Qué es: Nombre del hábito (verbo).
             *  UI: Text (max 120), placeholder "Leer 20 min".
             *  Tip: Valida que inicie con verbo para accionar. */
            $t->enum('tipo', ['positivo', 'negativo'])->default('positivo');
            /** Qué es: Naturaleza del hábito.
             *  UI: ChipGroup (Positivo/Negativo) con colores.
             *  Tip: Cambia la lógica de éxito (≥ vs ≤). */
            // positivo: "hacer X"; negativo: "no exceder X" o "reducir Y".

            // Métrica (si es cuantitativo). Si no usas meta+unidad ⇒ hábito binario.
            $t->string('unidad', 20)->nullable();                // UI: Select: min, reps, vasos, páginas...
            /** Qué es: Unidad de medida (min, reps, vasos, páginas…).
             *  UI: Select con opciones comunes + "otro".
             *  Tip: Si null → hábito binario (checkbox). */
            $t->decimal('meta', 8, 2)->nullable();               // objetivo cuantitativo (p.ej., 20.00 min)
            /** Qué es: Objetivo cuantitativo (p.ej., 20.00 min).
             *  UI: Number (step 0.5).
             *  Tip: Relevante sólo si hay unidad. */
            $t->decimal('umbral_cumplimiento', 8, 2)->nullable();
            /** Qué es: Umbral mínimo para marcar "cumplido".
             *  UI: Number (% o valor absoluto; define convención en UI).
             *  Tip: Si null → exige meta completa; en negativos se usa como límite máximo. */
            // % o valor mínimo aceptable para marcar "cumplido" (ej. ≥ 15 min de 20 => 75%). Si null ⇒ exacto meta.

            // Frecuencia avanzada
            $t->enum('periodicidad', ['diario', 'semanal', 'quincenal', 'mensual', 'anual'])->default('diario');
            /** Qué es: Cadencia de evaluación.
             *  UI: ChipGroup.
             *  Tip: Muestra widgets distintos por tipo. */
            $t->unsignedTinyInteger('times_per_week')->nullable();
            /** Qué es: Veces/semana (3/7, 4/7…).
             *  UI: Number 1..7, visible si “semanal”.
             *  Tip: Progreso "x/7" en tablero semanal. */
            // x/7 (ej. 3) si periodicidad = semanal.
            $t->unsignedTinyInteger('dias_semana_bitmap')->nullable();
            // bits L-M-Mi-J-V-S-D (LSB=Lunes). Ej. LU-MI-VI => 0b0101010 = 42.
            /** Qué es: Días objetivo (LU..DO) en bits.
             *  UI: WeekdayPicker (LU..DO).
             *  Tip: Guarda bitmap; front lo pinta con badges. */
            $t->unsignedTinyInteger('min_dias_mes')->nullable();
            // "al menos N días del mes" si periodicidad = mensual.
            /** Qué es: Mínimo de días al mes.
             *  UI: Number 1..31, visible si “mensual”.
             *  Tip: Contador “x/N este mes”. */

            // Control / vida útil
            $t->date('fecha_inicio')->nullable();
            /** Qué es: Fecha desde que aplica.
             *  UI: Date; por defecto hoy.
             *  Tip: Oculta log previos a inicio. */
            $t->boolean('activo')->default(true);
            /** Qué es: Encendido/apagado del hábito.
             *  UI: Toggle.
             *  Tip: Oculta en “Hoy” si está apagado. */

            // Priorización del hábito
            $t->unsignedTinyInteger('peso')->default(3);
            /** Qué es: Importancia 1–5.
             *  UI: Rating (⭐).
             *  Tip: Ordena sugerencias por peso. */
            // 1-5: importancia. Úsalo para ordenar y para sugerencias.

            // Streaks
            $t->unsignedInteger('streak')->default(0);
            /** Qué es: Racha actual.
             *  UI: Badge; no editable.
             *  Tip: Resalta cuando sube. */
            $t->unsignedInteger('mejor_streak')->default(0);
            /** Qué es: Mejor racha histórica.
             *  UI: Badge; no editable.
             *  Tip: Métrica de motivación. */

            // "Perdones" (no rompen racha)
            $t->unsignedTinyInteger('freezes_restantes_mes')->default(0);
            /** Qué es: Pausas “justificadas” restantes.
             *  UI: Botón “Usar freeze” (si >0).
             *  Tip: Decrementa y no rompe streak. */
            $t->unsignedTinyInteger('comodines_restantes_mes')->default(0);
            /** Qué es: Comodines por mes.
             *  UI: Botón “Usar comodín” (si >0).
             *  Tip: Marca cumplido sin valor. */
            // Resetea estos contadores al cambiar de mes (cron).

            // Integración con tareas (opcional)
            $t->foreignId('task_template_id')->nullable()->constrained('tareas')->nullOnDelete();
            /** Qué es: Plantilla de tarea vinculada.
             *  UI: Autocomplete.
             *  Tip: Al completar la tarea del día, marcar log. */
            // Al planear el día/semana, si está activo, se puede generar una tarea desde esta plantilla.
            // Y al completar la tarea del día, se marca el hábito (log) automáticamente.

            $t->longText('notas_md')->nullable();
            /** Qué es: Notas en Markdown.
             *  UI: Editor MD con preview.
             *  Tip: Guardar aprendizajes/reglas. */
            $t->timestamps();
            /** Qué es: created_at/updated_at.
             *  UI: Tooltip “hace X”. */

            $t->index(['activo', 'periodicidad', 'peso'], 'ix_habito_act_periodo_peso');
        });

        DB::statement('ALTER TABLE tareas ADD CONSTRAINT fk_habito_task_template FOREIGN KEY (habito_id) REFERENCES habitos(id) ON DELETE SET NULL');

        Schema::create('habito_log', function (Blueprint $t) {
            $t->id(); // UI: oculto; usar para keys.
            $t->foreignId('habito_id')->constrained('habitos')->cascadeOnDelete();
            /** Qué es: Hábito asociado.
             *  UI: oculto (contextual).
             *  Tip: FK consistente. */
            $t->date('fecha');
            /** Qué es: Día del registro (calendario).
             *  UI: Date read-only al marcar hoy.
             *  Tip: Único por (hábito, fecha). */ // fecha calendario del cumplimiento
            $t->decimal('valor', 8, 2)->nullable();              // cuánto hiciste (min, reps, etc.). Null si binario.
            /** Qué es: Valor cuantitativo del día.
             *  UI: Number + unidad (si aplica).
             *  Tip: Null si binario. */
            $t->boolean('cumplido')->default(false);             // marcado del día (true/false)
            /** Qué es: Check de cumplimiento.
             *  UI: Checkbox auto; deriva de valor/umbral/meta/tipo.
             *  Tip: Evita edición manual si se deriva. */
            $t->decimal('porcentaje', 5, 2)->nullable();         // 0..100 (si cuantitativo, calculado vs meta/umbral)
            /** Qué es: % de cumplimiento (0..100).
             *  UI: Progress mini.
             *  Tip: Calculado vs meta/umbral. */
            $t->foreignId('tarea_id')->nullable()->constrained('tareas')->nullOnDelete();
            // si provino de completar una tarea ligada al hábito (task.habito_id)
            /** Qué es: Tarea que gatilló el cumplimiento.
             *  UI: Link “ver tarea”.
             *  Tip: se llena al cerrar la tarea del hábito. */

            $t->timestamps();
            $t->unique(['habito_id', 'fecha'], 'uq_habito_log_fecha');
            $t->index(['fecha'], 'ix_habito_log_fecha');

            /**Comentarios clave de UI / lógica
             * - Binario vs cuantitativo: si meta y unidad son null ⇒ muestra simple checkbox diario. Si existen ⇒ muestra input numérico con unidad + barra de %.
             * - Negativo: para tipo='negativo' el éxito se evalúa por ≤ meta (o ≤ umbral).
             * - Cumplimiento parcial: calcula porcentaje y marca cumplido si porcentaje ≥ (umbral_cumplimiento% o 100%).

             * - Frecuencia:
             *   - Semanal (times_per_week): el widget muestra progreso “x/7” y colorea días objetivo según dias_semana_bitmap (si se definió).
             *   - Mensual (min_dias_mes): contador “x/N este mes”.
             
             * - Streaks: se actualizan con logs; freezes/commodines evitan romper la racha (botón “Usar comodín” en el día).
             * - Task template: si el hábito genera tarea, al completar la tarea del día: crear/actualizar habito_log (con tarea_id). */

            /** UI/Lógica:
             *  - Binario vs cuantitativo: si meta/unidad son null → checkbox; si existen → number + %.
             *  - Negativo: éxito si valor ≤ (umbral || meta).
             *  - Parcial: cumplido si % ≥ (umbral || 100%).
             *  - Semanal/mensual: pinta objetivos según periodicidad. */
        });

        Schema::create('rutinas', function (Blueprint $t) {
            $t->id(); // UI: oculto; usar como key/route param.
            $t->string('nombre', 120);                // UI: "Mañana", "Noche", "Pre-work"
            /** Qué es: Nombre (Mañana, Noche, Pre-work).
             *  UI: Text (max 120).
             *  Tip: emoji opcional 🌅🌙. */
            $t->string('descripcion', 300)->nullable();
            /** Qué es: Resumen breve.
             *  UI: Text; subheading en card.
             *  Tip: usa frases guía. */
            $t->enum('periodicidad', ['diario', 'semanal', 'quincenal', 'mensual', 'bimestral', 'anual'])->default('diario');
            /** Qué es: Cadencia sugerida.
             *  UI: ChipGroup.
             *  Tip: sólo informativa para UI, no bloquea. */
            $t->unsignedTinyInteger('dias_semana_bitmap')->nullable(); // opcional (LU..DO)
            /** Qué es: Días objetivo (LU..DO).
             *  UI: WeekdayPicker.
             *  Tip: Muestra en “Hoy” si coincide. */
            $t->time('horario_sugerido')->nullable(); // hint para mostrar en "Hoy"
            /** Qué es: Hora sugerida de ejecución.
             *  UI: Time picker; badge en card.
             *  Tip: Úsalo para ordenar en “Hoy”. */
            $t->boolean('activo')->default(true);
            /** Qué es: Rutina visible/oculta.
             *  UI: Toggle.
             *  Tip: Oculta de sugerencias si off. */
            $t->longText('notas_md')->nullable();
            $t->timestamps();
        });

        Schema::create('rutina_items', function (Blueprint $t) {
            $t->id(); // UI: oculto; usar como key/route param.
            $t->foreignId('rutina_id')->constrained('rutinas')->cascadeOnDelete();
            /** Qué es: Rutina padre.
             *  UI: implícito en la vista. */
            $t->enum('tipo', ['habito', 'tarea_micro', 'pausa', 'nota'])->default('habito');
            /** Qué es: Tipo de acción.
             *  UI: ChipGroup; iconifica cada tipo.
             *  Tip: cambia el control que se renderiza. */
            $t->foreignId('habito_id')->nullable()->constrained('habitos')->nullOnDelete();
            /** Qué es: Hábito a marcar (si tipo=habito).
             *  UI: Autocomplete Habitos.
             *  Tip: abrir mini-control del hábito. */
            $t->foreignId('task_template_id')->nullable()->constrained('tareas')->nullOnDelete();
            /** Qué es: Plantilla de microtarea (si tipo=tarea_micro).
             *  UI: Autocomplete Tareas (plantillas).
             *  Tip: al ejecutar, clona a “Hoy”. */
            $t->string('descripcion', 200)->nullable(); // Para "nota" o "tarea_micro" sin plantilla.
            /** Qué es: Texto guía (nota) o título de microacción sin plantilla.
             *  UI: Text; visible si tipo=nota o tarea_micro sin plantilla.
             *  Tip: conciso, accionable. */
            $t->unsignedSmallInteger('duracion_est_min')->nullable();
            /** Qué es: Estimado en minutos.
             *  UI: Number; suma total en cabecera.
             *  Tip: valida que “cabe” en tu bloque actual. */
            $t->boolean('obligatorio')->default(true);
            /** Qué es: Si el paso es requerido.
             *  UI: Toggle; muestra “opcional” en el paso.
             *  Tip: permite saltar sin penalizar. */
            $t->smallInteger('orden')->default(0);
            /** Qué es: Orden de ejecución.
             *  UI: Drag&drop; persistir.
             *  Tip: muestra número de paso. */
            $t->timestamps();

            $t->index(['rutina_id', 'orden'], 'ix_rutina_items_orden');

            /**Comentarios de UI / lógica
             * - Ejecución de rutina (UX): al pulsar “Iniciar rutina”, renderiza una checklist secuencial:
             *   - Si tipo='habito' → abrir mini control del hábito (checkbox o input cuantitativo) y marcar log del día.
             *   - Si tipo='tarea_micro' con task_template_id → crear tarea rápida (estado “hoy”) o ejecutar sin crear (según preferencia).
             *   - Si tipo='pausa' → sugerir temporizador corto (estirar/respirar).
             *   - Si tipo='nota' → mostrar texto guía.
             * - Duración estimada: muestra “Tiempo total ~ X min”; valida que cabe en el bloque disponible (lo que pedías con TimeBlocking).
             * - Orden drag&drop en edición. */
            /**4) Notas de integración rápidas
             * - Evaluación “cumplido” (positivo/cuanti):
             *   - porcentaje = (valor/meta)*100 (clamp 0..100).
             *   - cumplido = porcentaje >= (umbral_cumplimiento ?? 100).
             
             * - Evaluación “cumplido” (negativo):
             *   - cumplido = (valor <= (umbral_cumplimiento ?? meta)).
             *   - Si es binario negativo (sin meta), usa checkbox “No lo hice”.

             * - Reseteo de freezes/comodines: cron mensual setea contadores a valores por defecto (config).
             * - Rutina → hábitos/tareas: al ejecutar item:
             *   - tipo='habito' ⇒ crear/actualizar habito_logs(fecha=today).
             *   - tipo='tarea_micro' ⇒ si hay task_template_id, clonar a tarea “Hoy”; si no, crear tarea rápida con descripcion.
             
             * - TimeBlocking: al iniciar rutina, sumar duracion_est_min de sus items y validar que cabe en el bloque actual. */

            /** UX ejecución:
             *  - tipo=habito → marcar log del día (valor/checkbox).
             *  - tipo=tarea_micro → crear tarea Hoy (o ejecutar inline).
             *  - tipo=pausa → timer corto (respirar/estirar).
             *  - tipo=nota → mostrar instrucción.
             *  - Mostrar “Tiempo total ~ X min”; semáforo si no cabe en bloque. */
        });

        Schema::create('etiquetas', function (Blueprint $t) {
            $t->id();
            $t->string('nombre', 50);
            /**Qué es: texto visible de la etiqueta.
             * UI: Text (max 50). Sugerir existentes por frecuencia y texto.
             * Tip: normalizar a Title Case al mostrar. */
            $t->string('color', 20)->nullable();
            /** Qué es: color del chip.
             * UI: ColorPicker opcional. Si vacío, autocolor con verif. de contraste. */
            $t->unique(['nombre'], 'uq_etiqueta_nombre_categoria');
        });

        // Pivot polimórfico: etiqueta se aplica a *cualquier* entidad (tareas, proyectos, habitos, notas, finanzas, journal, etc.)
        Schema::create('etiquetables', function (Blueprint $t) {
            $t->foreignId('etiqueta_id')->constrained('etiquetas')->cascadeOnDelete();
            $t->morphs('taggable');                   // taggable_type (string), taggable_id (bigint)
            $t->primary(['etiqueta_id', 'taggable_id', 'taggable_type'], 'pk_etiquetables');
            /**Qué es: vínculo polimórfico a cualquier entidad (tarea, proyecto, hábito, nota, movimiento financiero, journal).
             * UI: en cada card, chips; en formularios, Autocomplete multi-select (máx. 5 etiquetas por ítem → valida en front). */
            $t->index(['taggable_type', 'taggable_id'], 'ix_etiquetables_target');
            $t->index(['etiqueta_id', 'taggable_type'], 'ix_etiquetables_label_scope');
            /**Reglas UX clave:
             * Máximo 5 etiquetas por elemento (enforce front + service).
             * Merge (fusionar duplicadas): acción admin → cambia etiqueta_id en etiquetables y borra la vieja. */
        });

        Schema::create('archivos', function (Blueprint $t) {
            $t->id();
            /** Qué es: Identificador único
             * UI: oculto; úsalo en rutas/keys.
             * Tip: Copiar al portapapeles desde el modal (debug/support). */
            $t->string('filename', 200);
            /** Qué es: Nombre original del archivo
             * UI: Mostrar en tarjetas/listas. Texto en tarjeta (con icono por tipo).
             * Tip: Validar extensión y tamaño al subir (front + service). Mostrar truncado con tooltip completo. */
            $t->string('mime', 120)->nullable();
            /** Qué es: Tipo MIME (image/png, application/pdf…)
             * UI: oculto; usar para ícono de preview. Badge pequeño con ícono.
             * Tip: Permite preview si es imagen/PDF/audio. Validar al subir (front + service). */
            $t->unsignedInteger('size_bytes')->nullable();
            /** Qué es: Tamaño en bytes
             * UI: Mostrar en tarjetas/listas (KB/MB).
             * Tip: Colorea si >10MB (para evitar cargas lentas). Validar al subir (front + service). */
            $t->string('storage_path', 300);         // ruta en storage
            /** Qué es: Ruta interna en el storage (no pública)
             * UI: oculto; úsalo para acceder al archivo.
             * Tip: No exponer directamente; usar URLs firmadas para acceso temporal. Backend lo usa para servir el archivo.*/
            $t->timestamps();
            /** Qué es: Fechas del sistema.
             * UI: Mostrar “Hace X días” en hover.
             * Tip: Usar para cálculo de antigüedad/decay (derivado). */
        });

        Schema::create('archivables', function (Blueprint $t) {
            $t->foreignId('archivo_id')->constrained('archivos')->cascadeOnDelete();
            /** Qué es: ID de archivo asociado.
             * UI: Tarjeta del archivo (filename, tamaño, botones).
             * Tip: Mostrar lista de adjuntos en cada entidad. */
            $t->morphs('archivable');                // archivable_type, archivable_id (Tarea, Evento, Proyecto…) (tipo + id)
            /** Qué es: vínculo polimórfico a cualquier entidad (tarea, proyecto, hábito, nota, movimiento financiero, journal).
             * UI: Decide a qué entidad se adjunta (Tarea, Proyecto, Evento, Hábito). en cada card, sección “Archivos” con tarjetas; en formularios, botón “Adjuntar archivo”.
             * Tip: Usar ícono de la entidad (📌 tarea, 📅 evento). Máximo 5 archivos por entidad (enforce front + service). */
            $t->primary(['archivo_id', 'archivable_id', 'archivable_type'], 'pk_archivables'); // Tip: Evita duplicar el mismo archivo en la misma entidad.
            $t->index(['archivable_type', 'archivable_id'], 'ix_archivables_target');

            /**Reglas UX clave:
             * -Vista previa inline si es imagen/PDF/audio (thumbnail o ícono grande).
             * -Botón “Descargar” (link firmado).
             * -Botón “Borrar” (elimina vínculo; si ningún otro vínculo, elimina archivo).
             * -Máximo 5 archivos por entidad (enforce front + service).
             * -Merge (fusionar duplicados): acción admin → cambia archivo_id en archivables y borra el viejo. 
             * - En cualquier entidad (Tarea, Proyecto, Evento): sección “Archivos adjuntos
             * - Tarjeta de archivo: icono + nombre + tamaño + botones (preview/download/delete). */
        });

        /**archivos/archivables
            Tarjetas con filename, peso, botón download, borrar; vista previa si imagen/PDF. */
        Schema::create('recursos', function (Blueprint $t) {
            $t->id();

            // Identidad y metadatos
            $t->string('titulo', 220);                       // UI: Text. Ej: “DDD con Laravel – Módulo 1”
            /** Qué es: Título visible del recurso (video, libro, curso).
             * UI: Text (max 220). Placeholder: “Título del recurso”.
             * Tip: Validar no vacío. */
            $t->enum('tipo', ['video', 'podcast', 'libro', 'articulo', 'pelicula', 'curso', 'documento', 'musica', 'otro'])->default('video');
            /**  Qué es: Categoría de recurso.
             * UI: ChipGroup con colores (video=rojo, libro=azul).
             * Tip: Filtro en listas. */

            // UI: ChipGroup; colorea por tipo
            $t->string('autor', 160)->nullable();            // UI: Text (canal/autor/ponente/editorial)
            /** Qué es: Autor, canal, editorial, ponente.
             * UI:  Subtexto debajo del título. Placeholder: “Autor o canal”.
             * Tip: Mostrar avatar/fav-icon si fuente es YouTube/Spotify. Sugerir existentes por frecuencia y texto. */
            $t->unsignedSmallInteger('anio')->nullable();    // UI: Number 1900..2100
            /** Qué es: Año de publicación (si aplica).
             * UI:  Badge pequeño. Number (1900–2100). Placeholder: “Año de publicación”.
             * Tip: Útil para libros/películas. */
            $t->string('genero', 80)->nullable();            // UI: Select libre / tags (p.ej. “tech”, “management”)
            /** Qué es: Género o tag de clasificación (tech, management, salud).
             * UI: Autocomplete multi-select (máx. 3). Placeholder: “Género o tema”.
             * Tip: Sugerir existentes por frecuencia y texto. Máximo 3 géneros. Permite búsquedas rápidas.*/

            // Origen
            $t->enum('fuente', ['youtube', 'vimeo', 'spotify', 'web', 'pdf', 'drive', 'local', 'otro'])->nullable();
            /** Qué es: Fuente o plataforma (YouTube, Spotify, web, local).
             * UI: Select con iconos. Ícono de plataforma. Placeholder: “Fuente o plataforma”.
             * Tip: Auto-detectar por URL. Mostrar favicon si URL es externa. */
            $t->string('url', 500)->nullable();              // si es externo
            /** Qué es: URL externa (video, artículo, curso).
             * UI:  Botón “Abrir”. Text (validar URL). Placeholder: “https://...”.
             * Tip: Auto-detectar fuente si es YouTube/Spotify/Vimeo. Validar formato. */
            $t->foreignId('archivo_id')->nullable()->constrained('archivos')->nullOnDelete(); // si subes el archivo
            /** Qué es: Archivo subido (PDF, video, audio).
             * UI: Botón de descarga o preview. Botón “Adjuntar archivo” (ver sección archivos).
             * Tip: Excluir si ya hay URL. Permitir solo 1 archivo. Validar tipo/tamaño al subir (front + service). */

            // Duración / contexto
            $t->unsignedSmallInteger('duracion_min_est')->nullable(); // UI: Number
            /** Qué es: Duración estimada en minutos (si aplica).
             * UI: ⏱ Badge. Number (minutos). Placeholder: “Duración estimada (min)”.
             * Tip: Usar para encaje en time-blocking. Útil para videos, podcasts, cursos. */
            $t->boolean('requiere_pantalla')->default(true); // UI: Toggle (tutoriales/cursos)
            /** Qué es: Si requiere atención visual (ej: curso). Requiere pantalla (no apto para audio-only).
             * UI: Toggle (pantalla/audio). Tooltip: “¿Se puede consumir sin mirar la pantalla?”.
             * Tip: Filtrar para bloques de foco. Filtrar para tardes/noches o mientras haces ejercicio. */
            $t->boolean('apto_fondo')->default(false);       // UI: Toggle (entrevista, charla, música)
            /** Qué es: Si es apto para “fondo” (ej: podcast, música).
             * UI: Toggle (fondo/foco). Tooltip: “¿Se puede consumir como ruido de fondo?”.
             * Tip: Sugerir en bloques de “admin”. Filtrar para tardes/noches o mientras haces tareas mecánicas. */
            $t->boolean('apto_auto')->default(false);        // UI: Toggle (modo audio)
            /** Qué es: Se puede consumir en el auto (modo audio). Si es apto para modo audio (ej: podcast, audiolibro).
             * UI: Toggle (audio/solo video). Tooltip: “¿Se puede consumir en modo audio?”.
             * Tip: Mostrar en vista móvil con ícono 🚗. Sugerir en bloques de “admin” o mientras conduces. Filtrar para tardes/noches o mientras haces tareas mecánicas. */

            // Propósito y prioridad
            $t->enum('proposito', ['educativo', 'inspirador', 'entretenimiento'])->default('educativo'); // UI: ChipGroup
            /** Qué es: Propósito principal de consumo (educativo, inspirador, entretenimiento).
             * UI: Chips con colores (Edu=verde, Insp=azul, Ent=amarillo). ChipGroup. Tooltip: “¿Cuál es el propósito principal de este recurso?”.
             * Tip: Filtrar en revisión semanal. Filtrar por propósito según momento del día (foco vs relax). */
            $t->enum('prioridad', ['baja', 'media', 'alta'])->default('media'); // UI: ChipGroup
            /** Qué es: Nivel de  Prioridad de consumo (baja, media, alta).
             * UI: Chips con colores (Baja=gris, Media=azul, Alta=rojo). ChipGroup. Tooltip: “¿Qué prioridad tiene este recurso para ti?”.
             * Tip: Orden de sugerencias. Usar en score para ordenar en revisión semanal. Filtrar por prioridad. */

            // Planificación / estado
            $t->date('plan_consumo_fecha')->nullable();      // UI: Date (opcional)
            /** Qué es: Fecha sugerida para consumir. (si tienes un plan).
             * UI: Date picker. Placeholder: “Fecha planificada de consumo”.
             * Tip: Mostrar en calendario personal. Mostrar en revisión semanal. Usar para ordenar en listas. */
            $t->date('fecha_caducidad')->nullable();         // UI: Date (auto-archivar al vencer)
            /** Qué es: Fecha de caducidad (si aplica). Si no lo consumes antes, se archiva.
             * UI: Badge roja si vencido. Date picker. Placeholder: “Fecha de caducidad (opcional)”.
             * Tip: Cron lo mueve a “archivado”. Auto-archivar si vence (lógica de servicio). Mostrar alerta si queda <3 días. */
            $t->enum('status', ['pendiente', 'en_progreso', 'consumido', 'archivado', 'vencido'])->default('pendiente');
            /** Qué es: Estado actual
             * UI: Chips con colores (Pendiente=azul, En progreso=amarillo, Consumido=verde, Archivado=gris, Vencido=rojo).
             * Tip: Filtro rápido.*/

            // Conversión semiautomática a tarea (weekly)
            $t->foreignId('tarea_id')->nullable()->constrained('tareas')->nullOnDelete();
            /** Qué es: Si se convierte en tarea, vínculo.
             * UI: Link a la tarea. Botón “Convertir en tarea” (crea tarea y liga).
             * Tip: Mostrar badge “Ligado a Tarea”. En revisión semanal, sugerir “Agregar 1–2 a esta semana” (crea tarea y liga). */
            $t->enum('conversion_modo', ['manual', 'semi', 'auto'])->default('semi'); // UI: ChipGroup pequeño
            /** Qué es: Modo de conversión a tarea.
             * UI: Chips pequeños (M/S/A). Tooltip: “¿Cómo prefieres convertir este recurso en tarea?”.
             * Tip: Si auto, al marcar “en progreso” → crea tarea automáticamente (lógica de servicio). Si semi, sugiere en revisión semanal. */
            $t->timestamp('ultimo_sugerido_at')->nullable();
            /** Qué es: Última vez que se sugirió en revisión semanal.
             * UI: Badge gris.
             * Tip: Evita sugerirlo más de 1 vez cada 2 semanas (lógica de servicio). */

            $t->longText('notas_md')->nullable();            // UI: Markdown
            /** Qué es: Notas adicionales en markdown (por qué, contexto, link).
             * UI: Editor compacto. Placeholder: “Notas adicionales (opcional)”.
             * Tip: Anotar insights o links adicionales. Usar para guardar contexto o links relacionados. */
            $t->timestamps();
            $t->softDeletes();                               // “Papelera”
            /** Qué es: Borrado lógico.
             * UI: Vista “Papelera” para recuperar.
             * Tip: Botón “Restaurar” o “Eliminar definitivamente”. Borrado físico tras 30 días. Filtro “incluye archivados” en búsquedas. */
            $t->index(['status', 'prioridad', 'proposito'], 'ix_recursos_estado_prio_prop');
            $t->index(['plan_consumo_fecha'], 'ix_recursos_plan');
            $t->index(['fecha_caducidad'], 'ix_recursos_caducidad');
        });

        Schema::create('resourceables', function (Blueprint $t) {
            $t->foreignId('recurso_id')->constrained('recursos')->cascadeOnDelete();
            /** Qué es: ID de recurso asociado.
             * UI: Tarjeta del recurso (favicon fuente, título, duración) (título, duración, propósito, prioridad, botones).
             * Tip: Listado dentro de Tarea/Proyecto/Hábito. */
            $t->morphs('resourceable'); // resourceable_type, resourceable_id (Tarea, Proyecto, Habito, Evento…)
            /** Qué es: vínculo polimórfico a cualquier entidad (tarea, proyecto, hábito, evento).
             * UI: Decide a qué entidad se asocia (Tarea, Proyecto, Hábito, Evento). en cada card, sección “Recursos” con tarjetas; en formularios, botón “Agregar recurso”.
             * Tip: Mostrar ícono de tipo padre. Usar ícono de la entidad (📌 tarea, 📅 evento). Máximo 5 recursos por entidad (enforce front + service). */
            $t->primary(['recurso_id', 'resourceable_id', 'resourceable_type'], 'pk_resourceables');
            $t->index(['resourceable_type', 'resourceable_id'], 'ix_resourceables_target');
            /** Notas de UI
             * - En tarjetas de Tarea/Proyecto/Hábito/Eventos, muestra sección “Recursos” con: favicon (fuente), título, duración, propósito, prioridad, botones “Ver / Convertir en tarea”.
             * - En Revisión Semanal: lista de recursos pendientes → botón “Agregar 1–2 a esta semana” (crea tarea y liga tarea_id). */
        });

        Schema::create('cuentas', function (Blueprint $t) {
            $t->id();
            $t->string('nombre', 120);
            /** Qué es: Nombre visible ("Billetera", "Tarjeta 1").
             * UI: Text; ícono según tipo; inline editable en listado. */

            $t->enum('tipo', ['billetera', 'cuenta', 'tarjeta_credito', 'prestamo_hipoteca']);
            /** Qué es: Tipo de cuenta.
             * UI: ChipGroup con iconos (👛, 🏦, 💳, 🏠).
             * Tip: Filtrar reportes por tipo. */

            $t->decimal('saldo_inicial', 14, 2)->default(0);
            /** Qué es: Saldo al crear la cuenta.
             * UI: Number MXN.
             * Tip: Solo editable al crear; luego mostrar en detalle. */

            $t->decimal('saldo_cache', 14, 2)->default(0);
            /** Qué es: Saldo actual (cache).
             * UI: Badge/contador; refrescar tras guardar movimientos.
             * Tip: Recalcular vía job nocturno para seguridad. */

            $t->boolean('activa')->default(true);
            /** Qué es: Ocultar/mostrar en selects y reportes.
             * UI: Toggle "Activa". */

            $t->string('notas', 300)->nullable();
            /** Qué es: Comentario corto (ej. corte tarjeta).
             * UI: Text; opcional. */

            $t->timestamps();
            $t->index(['tipo', 'activa']);
        });

        Schema::create('categorias_fin', function (Blueprint $t) {
            $t->id();
            $t->string('nombre', 120);
            /** Qué es: Nombre de categoría ("Servicios", "Alimentos").
             * UI: Text; evitar duplicados con validación. */

            $t->foreignId('parent_id')->nullable()->constrained('categorias_fin')->nullOnDelete();
            /** Qué es: Padre (árbol).
             * UI: TreePicker (drag&drop opcional).
             * Tip: Profundidad aconsejada ≤ 3. */

            $t->unsignedTinyInteger('depth')->default(0);
            /** Qué es: Nivel en el árbol (0 raíz).
             * UI: Oculto; útil para orden/indentado. */

            $t->unsignedSmallInteger('orden')->default(0);
            /** Qué es: Orden entre hermanos.
             * UI: Drag&drop en editor de categorías. */

            $t->timestamps();
            $t->unique(['parent_id', 'nombre']);  // evita duplicados por rama
        });

        Schema::create('movimientos', function (Blueprint $t) {
            $t->id();
            $t->enum('tipo', ['ingreso', 'gasto', 'transferencia', 'ajuste']);
            /** Qué es: Naturaleza del movimiento.
             * UI: Tabs o ChipGroup; cambia formulario (p.ej. transferencia pide 2 cuentas). */

            $t->string('descripcion', 200);
            /** Qué es: Título/nota corta.
             * UI: Requerido; placeholder “Pago internet Telmex”. */

            $t->string('contraparte', 160)->nullable();
            /** Qué es: Texto libre (quién).
             * UI: Text; autocompletar últimos usados. */

            $t->decimal('monto', 14, 2);
            /** Qué es: Importe MXN.
             * UI: Currency input; validación > 0. */

            $t->date('fecha_objetivo')->nullable();
            /** Qué es: Fecha planificada (vencimiento/cobro).
             * UI: Date; requerido si status='pendiente'. Aparece en “Hoy” si próximo. */

            $t->date('fecha_real')->nullable();
            /** Qué es: Fecha de pago/cobro realizado.
             * UI: Se autollenará al marcar realizado. */

            $t->enum('status', ['pendiente', 'realizado', 'vencido'])->default('realizado');
            /** Qué es: Estado del movimiento.
             * UI: Chips (azul/verde/rojo). “Vencido” si pasó fecha_objetivo. */

            // Vínculos a cuentas
            $t->foreignId('cuenta_id')->nullable()->constrained('cuentas')->nullOnDelete();
            /** Qué es: Cuenta origen (gasto/ajuste) o destino (ingreso).
             * UI: Select; obligatorio salvo transferencia (ver abajo). */

            $t->foreignId('cuenta_destino_id')->nullable()->constrained('cuentas')->nullOnDelete();
            /** Qué es: Solo para transferencia (cuenta destino).
             * UI: Visible solo si tipo=transferencia. */

            $t->uuid('transfer_group_id')->nullable();
            /** Qué es: Identificador para el par de asientos de una transferencia.
             * UI: Oculto; backend crea dos filas (salida/entrada) vinculadas. */

            // Categoría + tags
            $t->foreignId('categoria_id')->nullable()->constrained('categorias_fin')->nullOnDelete();
            /** Qué es: Categoría (árbol).
             * UI: TreePicker; requerido para reportes y presupuestos. */

            // Comprobante (1 archivo máx)
            $t->foreignId('archivo_id')->nullable()->constrained('archivos')->nullOnDelete();
            /** Qué es: PDF/Foto/XML único.
             * UI: Botón “Subir comprobante”; mostrar preview PDF/img. */

            // MSI / Pagos parciales (opcional)
            $t->boolean('tiene_plan_parcial')->default(false);
            /** Qué es: Marca si este movimiento tiene plan de pagos (MSI/hipoteca).
             * UI: Toggle que abre wizard de cuotas. */

            $t->unsignedTinyInteger('msi_meses')->nullable();
            $t->date('msi_inicio')->nullable();
            /** Qué es: Plan MSI (tarjeta) – meses y fecha inicio.
             * UI: Wizard: total → meses → genera cuotas pendientes. */

            // Enlaces operativos
            $t->timestamp('recordatorio_creado_at')->nullable();
            /** Qué es: Anti-duplicación para crear tarea/aviso en “Hoy”.
             * UI: Oculto; servicio semanal/diario lo usa. */

            $t->longText('notas_md')->nullable();

            $t->timestamps();

            // Índices
            $t->index(['status', 'fecha_objetivo']);
            $t->index(['tipo', 'fecha_real']);
            $t->index(['cuenta_id', 'cuenta_destino_id']);
            $t->index(['categoria_id']);
        });

        // 3b) CUOTAS (parciales / MSI / hipoteca)
        Schema::create('movimiento_cuotas', function (Blueprint $t) {
            $t->id();
            $t->foreignId('movimiento_id')->constrained('movimientos')->cascadeOnDelete();
            /** Qué es: Movimiento padre (ej. compra a MSI, hipoteca).
             * UI: En detalle muestra tabla de cuotas. */

            $t->unsignedSmallInteger('numero'); // 1..N
            $t->decimal('monto', 14, 2);
            $t->date('fecha_objetivo');
            $t->enum('status', ['pendiente', 'realizado', 'vencido'])->default('pendiente');

            $t->foreignId('pago_mov_id')->nullable()->constrained('movimientos')->nullOnDelete();
            /** Qué es: Movimiento de pago que liquidó esta cuota.
             * UI: Link al pago correspondiente. */

            $t->timestamps();
            $t->unique(['movimiento_id', 'numero']);
            $t->index(['status', 'fecha_objetivo']);
        });

        // 4) PRESUPUESTOS
        Schema::create('presupuestos', function (Blueprint $t) {
            $t->id();
            $t->foreignId('categoria_id')->constrained('categorias_fin')->cascadeOnDelete();
            /** Qué es: Categoría objetivo del presupuesto.
             * UI: TreePicker; muestra nombre con ruta (Hogar > Servicios). */

            $t->enum('periodo', ['mensual', 'semanal'])->default('mensual');
            /** Qué es: Tipo de período.
             * UI: ChipGroup; por simplicidad usarás mensual como base. */

            $t->unsignedSmallInteger('anio');
            $t->unsignedTinyInteger('mes')->nullable();       // 1..12 si mensual
            $t->unsignedTinyInteger('semana_iso')->nullable(); // 1..53 si semanal

            $t->decimal('monto_plan', 14, 2);
            /** Qué es: Tope de gasto (o meta de ingreso) para el período.
             * UI: Currency input. */

            $t->decimal('monto_real_cache', 14, 2)->default(0);
            /** Qué es: Ejecutado a la fecha (cache).
             * UI: Barra progreso (real/plan). Recalcular tras guardar movimientos. */

            $t->timestamps();
            $t->unique(['categoria_id', 'periodo', 'anio', 'mes', 'semana_iso'], 'uq_presu_periodo');
        });

        // 5) RECURRENTES (generan pendientes)
        Schema::create('movto_recurrentes', function (Blueprint $t) {
            $t->id();
            $t->enum('tipo', ['ingreso', 'gasto'])->default('gasto');
            $t->string('descripcion', 200);
            $t->decimal('monto', 14, 2);
            $t->foreignId('cuenta_id')->constrained('cuentas')->cascadeOnDelete();
            $t->foreignId('categoria_id')->nullable()->constrained('categorias_fin')->nullOnDelete();

            $t->enum('frecuencia', ['diaria', 'semanal', 'mensual'])->default('mensual');
            $t->unsignedTinyInteger('dia_semana')->nullable(); // 1..7 (si semanal)
            $t->unsignedTinyInteger('dia_mes')->nullable();    // 1..28/31 (si mensual)
            /** UI: Builder simple (ej. “cada mes el día 10”). */

            $t->date('next_run');
            $t->boolean('activo')->default(true);

            $t->timestamps();
            $t->index(['activo', 'next_run']);
        });

        Schema::create('sesiones_trabajo', function (Blueprint $t) {
            $t->id();

            $t->foreignId('tarea_id')->nullable()->constrained('tareas')->nullOnDelete();
            /** Qué es: vínculo a la tarea (si aplica).
             * UI: si inicias desde una tarea → se autollena. Puede ser null para sesiones “libres”. */

            $t->enum('tipo', ['trabajo', 'descanso']); // UI: badge en timeline.
            /**Qué es: marca la fase.
             * UI: se setea por el temporizador (no editable). */

            $t->dateTime('inicio');                   // UI: reloj al iniciar (no editable).
            $t->dateTime('fin')->nullable();          // UI: se fija al detener. Inmutabilidad: app-side.
            /**Qué es: timestamps.
             * UI: el usuario no los edita después (inmutabilidad). Mostrar “hace 12 min”. */

            $t->unsignedSmallInteger('foco_min')->default(0);     // minutos de foco realizados en esta sesión.
            $t->unsignedSmallInteger('descanso_min')->default(0); // minutos de descanso realizados (si aplica).
            /**Qué es: minutos efectivos.
             * UI: se rellenan al cerrar sesión; mostrar totales por día y por tarea. */

            $t->enum('modo_rollover', ['acumulativo', 'balanceado', 'estricto'])->default('acumulativo');
            /**Qué es: regla para el siguiente ciclo.
             * UI: se toma del modo del día; opcional override de sesión (si habilitas “Opciones avanzadas”), pero se puede forzar por sesión si habilitas un toggle avanzado. */

            $t->json('next_focus_suggestion')->nullable();
            /**Qué es: recomendación de “lo próximo” al cerrar la sesión.
             * UI: mini banner: “Sugerencia: Volver a 🐸 Frog (tarea #123)”. 
             * UI: JSON ligero con recomendación al cerrar (e.g. { "tarea_id": 123, "razon":"frog" }).
             * Tip: front lo usa para mostrar “Siguiente sugerencia”. */
            /**{
             *  "tarea_id": 123,
             *  "razon": "frog|score|continuidad|contexto",
             *  "titulo": "Preparar propuesta Hospital X",
             *  "score": 12.8
             * } */

            $t->string('notas', 400)->nullable();     // UI: comentario breve opcional.

            $t->timestamps();

            /** Reglas UX clave:
             * -Cierre de sesión inmutable: no permitir edición post-cierre (el front grisa inputs).
             * -Al cerrar una sesión con tarea_id y tipo='trabajo' → sumar pomos_realizados (o minutos) a la tarea (lógica de servicio).
             * -Sugerencia se calcula al cerrar en base a: Frog pendiente → Score alto → No terminadas hoy → Misma categoría/contexto. */

            $t->index(['tarea_id', 'inicio'], 'ix_sesion_tarea_inicio');
            $t->index(['inicio'], 'ix_sesion_inicio');
        });

        Schema::create('eventos', function (Blueprint $t) {
            $t->id();
            $t->string('titulo', 200);
            /** Qué es: Título visible del evento
             *  UI: Text; placeholder “Junta equipo / Ballet Lua / Médico”. mostrar chips (tipo_evento color).
             *  Tip: Validar que empiece con verbo si es “bloque de trabajo” */
            $t->foreignId('tipo_evento_id')->constrained('tipo_evento');
            /** Qué es: Categoría/Tipo con color
             *  UI: ChipGroup con color; editable. Select con ColorPicker; permitir crear/editar. */
            $t->dateTime('fecha_inicio');
            $t->dateTime('fecha_fin')->nullable();
            /** Qué es: Inicio/fin (si all_day, usar sólo fecha_inicio)
             *  UI: DateTime pickers; si all_day=true, ocultar hora */

            $t->boolean('all_day')->default(false);
            /** Qué es: Evento de día completo
             *  UI: Toggle; oculta horas */

            // Repetición (RRULE simplificado y friendly)
            $t->string('rrule', 400)->nullable();
            /** Qué es: Regla iCal RRULE (ej: FREQ=WEEKLY;BYDAY=MO,WE;INTERVAL=1)
             *  UI: Builder visual: (Frecuencia: diaria/semanal/mensual; Días; Intervalo; Fin; “omitir fechas”) */

            $t->json('exdates')->nullable();
            /** Qué es: Excepciones a la recurrencia (fechas saltadas)
             *  UI: lista de fechas quitadas (UI: agregar/retirar chips). */

            // Relaciones opcionales (flexibles) Autocomplete (opcionales).
            $t->foreignId('proyecto_id')->nullable()->constrained('proyectos')->nullOnDelete();
            $t->foreignId('tarea_id')->nullable()->constrained('tareas')->nullOnDelete();
            $t->foreignId('persona_id')->nullable()->constrained('personas')->nullOnDelete();

            // Sin recordatorios push; sólo “inbox de Hoy”
            $t->boolean('recordatorio_inbox')->default(true);
            /** Qué es: Mostrar aviso suave en Hoy
             *  UI: Toggle “Mostrar en Inbox de Hoy” 
             * si ON, el evento aparece en “Hoy” (sección “Agenda”). */

            // Sincronización externa (Google/iCal) — opcional (oculto)
            $t->string('external_source', 40)->nullable();  // 'google','ical','outlook'
            $t->string('external_id', 120)->nullable();
            $t->json('external_payload')->nullable();
            /** Qué es: Campos de integración (lectura/escritura)
             *  UI: Oculto */

            $t->longText('notas_md')->nullable();
            /** Qué es: Notas MD (agenda de junta, objetivos)
             *  UI: Markdown editor 
             * MD editor; ideal para pauta de reunión. */

            $t->timestamps();
            $t->index(['fecha_inicio', 'fecha_fin'], 'ix_evento_fecha');
        });

        Schema::create('timeblocks', function (Blueprint $t) {
            $t->id();
            $t->date('fecha');                                   // UI: día del bloque
            $t->time('hora_inicio');                             // UI: time picker
            $t->time('hora_fin');                                // UI: time picker

            $t->string('categoria', 60)->nullable();             // UI: texto libre o catálogo (deep work, admin, familia…)
            $t->string('descripcion', 200)->nullable();          // UI: nota breve (ej. “Deep Work proyecto X”)

            $t->boolean('disponible')->default(true);
            /** Qué es: Bloque reservado para “trabajo ejecutable”
             *  UI: Toggle; si false, no permite encajar tareas. si OFF, el bloque cuenta para agenda pero no encaja tareas. */

            $t->unsignedSmallInteger('capacidad_min')->default(0);
            /** Qué es: Minutos “encajables” (puede ser < duración de bloque si habrá interrupciones)
             *  UI: Number; mostrar barra de consumo.
             * barra de consumo (usado/total). */

            // Parkinson (límites artificiales por bloque)
            $t->boolean('parkinson_enforce')->default(false);
            $t->unsignedSmallInteger('parkinson_max_min')->nullable();
            /** Qué es: Límite máximo intencional dentro del bloque (ej. “emails ≤ 20 min”)
             *  UI: Toggle + Number; alert si superas.
             * al correr timer dentro del bloque, alerta si excedes. */

            // Relación opcional con evento (si el bloque proviene de un evento de calendario)
            $t->foreignId('evento_id')->nullable()->constrained('eventos')->nullOnDelete();
            /**
             * Qué es: vínculo a evento (si aplica).
             * UI: Autocomplete; si el bloque viene de un evento, se autollena
             * Tip: si el evento cambia, actualizar bloques relacionados (lógica de servicio).
             * si el bloque proviene de un evento recurrente (“Ballet Lua”), linkear y pintar. */

            $t->timestamps();
            $t->index(['fecha', 'hora_inicio'], 'ix_timeblock_fecha_inicio');
            /**Cada tarea tiene pomos_estimados → duración en minutos (pomos_estimados * 25).
             * Capacidad disponible del día vs. duración de Frog + Rocas + extras.
             * Si no cabe, avisa:
             * “Hoy solo tienes 90 min de deep work, pero esta Frog requiere 120. ¿Quieres moverla a otro día o partirla?”.
             */
        });

        Schema::create('entrada_diario', function (Blueprint $t) {
            $t->id();

            // FECHA/HORA
            $t->date('fecha');                               // Qué es: Día calendario de la entrada.
            // UI: Se agrupa por día (calor/semana). Se llena con now()->toDateString().
            $t->dateTime('momento')->useCurrent();           // Qué es: Timestamp exacto (permite varias entradas por día).
            // UI: Orden cronológico dentro del día.

            // CONTENIDO
            $t->longText('contenido_md');                    // Qué es: Texto en Markdown.
            // UI: Editor MD simple + preview. Atajos: /**, ##, - .
            // Tip: Al convertir a tarea, tomar primeros N caracteres como título.

            // MOOD (escala única por entrada)
            $t->enum('mood_principal', ['increible', 'bien', 'meh', 'mal', 'horrible'])->nullable();
            // UI: 5 caritas (como imagen de referencia) coloreadas.
            // Tip: Guardar opcional; heatmap usa mood_escala si existe.
            $t->unsignedTinyInteger('mood_escala')->nullable(); // 1–5 (map: 5=increible … 1=horrible)
            // UI: Slider/Picker 1–5; sincroniza con mood_principal.

            // DATOS LIGEROS PARA CORRELACIONES
            $t->decimal('sueno_horas', 4, 2)->nullable();    // UI: input numérico opcional (0–24 con step 0.25).
            // Tip: Para correlación simple mood vs. sueño.
            $t->boolean('plantilla_diaria')->default(false); // UI: si se generó desde “Diario (3 preguntas)”.
            // Tip: Renderiza prompts predefinidos.

            // VÍNCULOS
            $t->foreignId('tarea_id')->nullable()->constrained('tareas')->nullOnDelete();
            // UI: Botón “Convertir en tarea” → crea y liga aquí.
            // Tip: Si se borra la tarea, deja null (no borres la entrada).
            // Adjuntos: usar tablas archivos/archivables (morph).
            // Etiquetas: usar tablas etiquetas/taggables (morph). Para subetiquetas de estado de ánimo
            //            sugiere prefijo “mood:” (p.ej., mood:estresado, mood:enfermo).

            $t->timestamps();

            // BÚSQUEDA
            $t->index('fecha', 'ix_entrada_fecha');
        });

        DB::statement('ALTER TABLE entrada_diario ADD FULLTEXT ft_entrada_contenido (contenido_md)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timeblocks');
        Schema::dropIfExists('eventos');
        Schema::dropIfExists('sesiones_trabajo');
        Schema::dropIfExists('movto_recurrentes');
        Schema::dropIfExists('presupuestos');
        Schema::dropIfExists('movimiento_cuotas');
        Schema::dropIfExists('movimientos');
        Schema::dropIfExists('resourceables');
        Schema::dropIfExists('recursos');
        Schema::dropIfExists('archivables');
        Schema::dropIfExists('archivos');
        Schema::dropIfExists('etiquetables');
        Schema::dropIfExists('etiquetas');
        Schema::dropIfExists('rutina_items');
        Schema::dropIfExists('rutinas');
        Schema::dropIfExists('habito_log');
        Schema::dropIfExists('habitos');
        Schema::dropIfExists('entrada_diario');
        Schema::dropIfExists('tareas');
        Schema::dropIfExists('proyecto_objetivos');
        Schema::dropIfExists('proyecto_etapas');
        Schema::dropIfExists('proyectos');
        Schema::dropIfExists('personas');
        Schema::dropIfExists('tipo_evento');
        Schema::dropIfExists('categorias_fin');
        Schema::dropIfExists('cuentas');
        Schema::dropIfExists('contextos');
        Schema::dropIfExists('areas');
    }
};
