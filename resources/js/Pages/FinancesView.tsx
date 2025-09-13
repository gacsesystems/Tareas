import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Switch } from "@/Components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Progress } from "@/Components/ui/progress";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    AlertCircle,
    Plus,
    CreditCard,
    Wallet,
    Building,
    Home,
    Settings,
    PieChart,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";

export function FinancesView() {
    const movements = [
        {
            id: 1,
            type: "cobro",
            client: "Cliente ABC Corp",
            amount: 15000,
            dueDate: "2025-09-03",
            status: "pendiente",
            description: "Desarrollo web corporativo",
        },
        {
            id: 2,
            type: "cobro",
            client: "Startup XYZ",
            amount: 25000,
            dueDate: "2025-09-06",
            status: "pendiente",
            description: "Consultoría técnica",
        },
        {
            id: 3,
            type: "pago",
            client: "Proveedor Software",
            amount: 8000,
            dueDate: "2025-09-04",
            status: "pendiente",
            description: "Licencias anuales",
        },
        {
            id: 4,
            type: "cobro",
            client: "Cliente DEF",
            amount: 12000,
            dueDate: "2025-08-30",
            status: "vencido",
            description: "Mantenimiento sistema",
        },
        {
            id: 5,
            type: "cobro",
            client: "Empresa GHI",
            amount: 18500,
            dueDate: "2025-08-28",
            status: "cobrado",
            description: "Proyecto completado",
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "cobrado":
                return "default";
            case "pendiente":
                return "secondary";
            case "vencido":
                return "destructive";
            default:
                return "outline";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "cobrado":
                return "Cobrado";
            case "pendiente":
                return "Pendiente";
            case "vencido":
                return "Vencido";
            default:
                return status;
        }
    };

    const totalCobros = movements
        .filter((m) => m.type === "cobro" && m.status === "pendiente")
        .reduce((acc, m) => acc + m.amount, 0);
    const totalPagos = movements
        .filter((m) => m.type === "pago" && m.status === "pendiente")
        .reduce((acc, m) => acc + m.amount, 0);
    const vencidos = movements
        .filter((m) => m.status === "vencido")
        .reduce((acc, m) => acc + m.amount, 0);
    const cobrados = movements
        .filter((m) => m.type === "cobro" && m.status === "cobrado")
        .reduce((acc, m) => acc + m.amount, 0);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-balance">
                        Finanzas Lite
                    </h1>
                    <p className="text-muted-foreground">
                        Seguimiento de cobros y pagos
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Movimiento
                </Button>
            </div>

            {/* Resumen financiero */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-chart-3" />
                            <span className="text-sm text-muted-foreground">
                                Por cobrar
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-chart-3">
                            ${totalCobros.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-chart-5" />
                            <span className="text-sm text-muted-foreground">
                                Por pagar
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-chart-5">
                            ${totalPagos.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <span className="text-sm text-muted-foreground">
                                Vencidos
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-destructive">
                            ${vencidos.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Cobrado este mes
                            </span>
                        </div>
                        <p className="text-2xl font-bold">
                            ${cobrados.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Radar de próximos 7 días */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Radar - Próximos 7 Días
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {movements
                            .filter((m) => {
                                const dueDate = new Date(m.dueDate);
                                const today = new Date();
                                const nextWeek = new Date(
                                    today.getTime() + 7 * 24 * 60 * 60 * 1000
                                );
                                return (
                                    dueDate >= today &&
                                    dueDate <= nextWeek &&
                                    m.status === "pendiente"
                                );
                            })
                            .map((movement) => (
                                <div
                                    key={movement.id}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        {movement.type === "cobro" ? (
                                            <TrendingUp className="h-4 w-4 text-chart-3" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-chart-5" />
                                        )}
                                        <div>
                                            <p className="font-medium">
                                                {movement.client}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {movement.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Vence: {movement.dueDate}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={`font-bold ${
                                                movement.type === "cobro"
                                                    ? "text-chart-3"
                                                    : "text-chart-5"
                                            }`}
                                        >
                                            ${movement.amount.toLocaleString()}
                                        </p>
                                        <Badge
                                            variant={
                                                getStatusColor(
                                                    movement.status
                                                ) as any
                                            }
                                            className="text-xs"
                                        >
                                            {getStatusText(movement.status)}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>

            {/* Todos los movimientos */}
            <Card>
                <CardHeader>
                    <CardTitle>Todos los Movimientos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {movements.map((movement) => (
                            <div
                                key={movement.id}
                                className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {movement.type === "cobro" ? (
                                        <TrendingUp className="h-4 w-4 text-chart-3" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-chart-5" />
                                    )}
                                    <div>
                                        <p className="font-medium">
                                            {movement.client}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {movement.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p
                                            className={`font-bold ${
                                                movement.type === "cobro"
                                                    ? "text-chart-3"
                                                    : "text-chart-5"
                                            }`}
                                        >
                                            ${movement.amount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {movement.dueDate}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            getStatusColor(
                                                movement.status
                                            ) as any
                                        }
                                    >
                                        {getStatusText(movement.status)}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
