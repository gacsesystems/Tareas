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

const string CorsDev = "CorsDev";

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsDev, policy =>
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
    // .AllowCredentials() // sólo si usarás cookies/autenticación
    );
});

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors(CorsDev);
app.MapGet("/", () => Results.Redirect("/swagger"));
// app.UseHttpsRedirection(); // opcional en dev
// Map endpoints...

// REGISTRO DE MODULOS
app.MapProyectos();
app.MapTareas();
app.MapSesiones();   // crea archivo con tus endpoints actuales
app.MapDiario();     // idem
app.MapExport();     // idem (con Csv helper)
app.MapConfig();     // el de pesos

app.Run();