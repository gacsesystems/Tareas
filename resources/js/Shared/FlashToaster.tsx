import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { useToast } from "@/Components/ui/use-toast";

export default function FlashToaster() {
    const { toast } = useToast();
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.toast) {
            toast({
                title: flash.toast.title,
                description: flash.toast.desc,
                variant:
                    flash.toast.type === "success" ? "default" : "destructive",
            });
        }
    }, [flash?.toast]);

    return null;
}
