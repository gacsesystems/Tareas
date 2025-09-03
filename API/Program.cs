using API.Endpoints;
using Aplicacion.Tareas;
using Infraestructura.Persistencia;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")
                                            ?? "Server=LAP_SAUL;Database=PROD_SAUL;Trusted_Connection=True;TrustServerCertificate=True;"));

builder.Services.AddSingleton<IServicioPrioridadTareas, ServicioPrioridadTareas>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.MapGet("/", () => Results.Redirect("/swagger"));

// REGISTRO DE MODULOS
app.MapProyectos();
app.MapTareas();
app.MapSesiones();   // crea archivo con tus endpoints actuales
app.MapDiario();     // idem
app.MapExport();     // idem (con Csv helper)
app.MapConfig();     // el de pesos

app.Run();