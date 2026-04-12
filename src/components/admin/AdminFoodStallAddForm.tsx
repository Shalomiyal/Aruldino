import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageHero, AdminPageStack, AdminBackToDashboard } from '@/components/admin';
import { digitsOnlyPhone, requireMinLen10, minLen10IfPresent, validatePositiveNumber } from '@/lib/admin/validation';

interface MenuRow {
    name: string;
    price: string;
}

const AdminFoodStallAddForm = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        shopName: '',
        ownerName: '',
        address: '',
        description: '',
        city: '',
        phone: '',
        whatsapp: '',
    });

    const [menuItems, setMenuItems] = useState<MenuRow[]>([
        { name: '', price: '' },
    ]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        const shopNameError = requireMinLen10(form.shopName, 'Shop name');
        if (shopNameError) newErrors.shopName = shopNameError;

        const ownerNameError = requireMinLen10(form.ownerName, 'Owner name');
        if (ownerNameError) newErrors.ownerName = ownerNameError;

        const addressError = requireMinLen10(form.address, 'Address');
        if (addressError) newErrors.address = addressError;

        const descriptionError = requireMinLen10(form.description, 'Description');
        if (descriptionError) newErrors.description = descriptionError;

        const cityError = minLen10IfPresent(form.city, 'City / area');
        if (cityError) newErrors.city = cityError;

        const phoneError = requireMinLen10(form.phone, 'Phone') || 
            (digitsOnlyPhone(form.phone).length !== 10 ? 'Phone must be exactly 10 digits' : null);
        if (phoneError) newErrors.phone = phoneError;

        if (form.whatsapp) {
            const whatsappDigits = digitsOnlyPhone(form.whatsapp);
            if (whatsappDigits.length !== 0 && whatsappDigits.length !== 10) {
                newErrors.whatsapp = 'WhatsApp must be exactly 10 digits if provided';
            }
        }

        menuItems.forEach((row, index) => {
            if (row.name || row.price) {
                if (row.name && !requireMinLen10(row.name, `Item ${index + 1}`)) {
                    // name is valid
                } else if (row.name) {
                    newErrors[`menu_name_${index}`] = `Item name must be at least 10 characters`;
                }
                
                if (row.price && parseFloat(row.price) <= 0) {
                    newErrors[`menu_price_${index}`] = `Price must be greater than 0`;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const validMenuItems = menuItems.filter(row => row.name && row.price && parseFloat(row.price) > 0);

            const { error } = await supabase.from('food_stalls' as any).insert([{
                shop_name: form.shopName.trim(),
                owner_name: form.ownerName.trim(),
                address: form.address.trim(),
                description: form.description.trim(),
                city: form.city.trim() || null,
                phone: digitsOnlyPhone(form.phone),
                whatsapp: form.whatsapp ? digitsOnlyPhone(form.whatsapp) : null,
                menu_items: validMenuItems,
                is_active: true,
                created_at: new Date().toISOString()
            } as any]);

            if (error) throw error;

            toast({ title: 'Food stall added successfully' });
            navigate('/admin/food-stalls');
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (field: 'phone' | 'whatsapp', value: string) => {
        const digits = digitsOnlyPhone(value);
        setForm(prev => ({ ...prev, [field]: digits }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const addMenuRow = () => {
        setMenuItems([...menuItems, { name: '', price: '' }]);
    };

    const removeMenuRow = (index: number) => {
        if (menuItems.length > 1) {
            setMenuItems(menuItems.filter((_, i) => i !== index));
        }
    };

    const updateMenuRow = (index: number, field: keyof MenuRow, value: string) => {
        const updated = [...menuItems];
        updated[index] = { ...updated[index], [field]: value };
        setMenuItems(updated);
        if (errors[`menu_${index}`]) setErrors(prev => ({ ...prev, [`menu_${index}`]: '' }));
    };

    return (
        <form onSubmit={handleSubmit}>
            <AdminPageHero 
                title="Add Food Stall"
                description="Add a new food stall to the campus"
                icon={<span className="text-white">F</span>}
            />
            <AdminPageStack>
                <AdminBackToDashboard to="/admin/food-stalls" />
                
                <Card className="border border-gray-200 shadow-lg bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Shop Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Shop Name *</Label>
                                <Input 
                                    className={`rounded-xl border-gray-200 ${errors.shopName ? 'border-red-500' : ''}`}
                                    placeholder="Enter shop name (min 10 chars)"
                                    value={form.shopName}
                                    onChange={(e) => {
                                        setForm(prev => ({ ...prev, shopName: e.target.value }));
                                        if (errors.shopName) setErrors(prev => ({ ...prev, shopName: '' }));
                                    }}
                                />
                                {errors.shopName && <p className="text-xs text-red-500">{errors.shopName}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Owner Name *</Label>
                                <Input 
                                    className={`rounded-xl border-gray-200 ${errors.ownerName ? 'border-red-500' : ''}`}
                                    placeholder="Enter owner name (min 10 chars)"
                                    value={form.ownerName}
                                    onChange={(e) => {
                                        setForm(prev => ({ ...prev, ownerName: e.target.value }));
                                        if (errors.ownerName) setErrors(prev => ({ ...prev, ownerName: '' }));
                                    }}
                                />
                                {errors.ownerName && <p className="text-xs text-red-500">{errors.ownerName}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Address *</Label>
                            <Input 
                                className={`rounded-xl border-gray-200 ${errors.address ? 'border-red-500' : ''}`}
                                placeholder="Enter full address (min 10 chars)"
                                value={form.address}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, address: e.target.value }));
                                    if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                                }}
                            />
                            {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Description *</Label>
                            <Input 
                                className={`rounded-xl border-gray-200 ${errors.description ? 'border-red-500' : ''}`}
                                placeholder="Enter description (min 10 chars)"
                                value={form.description}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, description: e.target.value }));
                                    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                                }}
                            />
                            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>City / Area</Label>
                            <Input 
                                className={`rounded-xl border-gray-200 ${errors.city ? 'border-red-500' : ''}`}
                                placeholder="Enter city (min 10 chars if provided)"
                                value={form.city}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, city: e.target.value }));
                                    if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                                }}
                            />
                            {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Phone *</Label>
                                <Input 
                                    className={`rounded-xl border-gray-200 ${errors.phone ? 'border-red-500' : ''}`}
                                    placeholder="Enter 10-digit phone number"
                                    value={form.phone}
                                    onChange={(e) => handlePhoneChange('phone', e.target.value)}
                                    maxLength={10}
                                />
                                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>WhatsApp</Label>
                                <Input 
                                    className={`rounded-xl border-gray-200 ${errors.whatsapp ? 'border-red-500' : ''}`}
                                    placeholder="Enter 10-digit WhatsApp number"
                                    value={form.whatsapp}
                                    onChange={(e) => handlePhoneChange('whatsapp', e.target.value)}
                                    maxLength={10}
                                />
                                {errors.whatsapp && <p className="text-xs text-red-500">{errors.whatsapp}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-lg bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Menu Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {menuItems.map((row, index) => (
                            <div key={index} className="flex gap-4 items-start">
                                <div className="flex-1 space-y-2">
                                    <Label>Item Name</Label>
                                    <Input 
                                        className={`rounded-xl border-gray-200 ${errors[`menu_name_${index}`] ? 'border-red-500' : ''}`}
                                        placeholder="e.g. Chicken Fried Rice"
                                        value={row.name}
                                        onChange={(e) => updateMenuRow(index, 'name', e.target.value)}
                                    />
                                    {errors[`menu_name_${index}`] && <p className="text-xs text-red-500">{errors[`menu_name_${index}`]}</p>}
                                </div>
                                <div className="w-32 space-y-2">
                                    <Label>Price (₹)</Label>
                                    <Input 
                                        type="number"
                                        step="0.01"
                                        className={`rounded-xl border-gray-200 ${errors[`menu_price_${index}`] ? 'border-red-500' : ''}`}
                                        placeholder="0.00"
                                        value={row.price}
                                        onChange={(e) => updateMenuRow(index, 'price', e.target.value)}
                                    />
                                    {errors[`menu_price_${index}`] && <p className="text-xs text-red-500">{errors[`menu_price_${index}`]}</p>}
                                </div>
                                <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="icon"
                                    className="mt-6"
                                    onClick={() => removeMenuRow(index)}
                                    disabled={menuItems.length === 1}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addMenuRow} className="rounded-xl">
                            <Plus className="h-4 w-4 mr-2" /> Add Menu Item
                        </Button>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/food-stalls')} className="rounded-xl">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="rounded-xl gradient-primary">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Food Stall
                    </Button>
                </div>
            </AdminPageStack>
        </form>
    );
};

export default AdminFoodStallAddForm;