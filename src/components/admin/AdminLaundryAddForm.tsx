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

interface PriceRow {
    service: string;
    price: string;
}

const AdminLaundryAddForm = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        shopName: '',
        ownerName: '',
        address: '',
        city: '',
        phone: '',
        whatsapp: '',
        deliveryRadius: '',
    });

    const [priceList, setPriceList] = useState<PriceRow[]>([
        { service: '', price: '' },
    ]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        const shopNameError = requireMinLen10(form.shopName, 'Shop name');
        if (shopNameError) newErrors.shopName = shopNameError;

        const ownerNameError = requireMinLen10(form.ownerName, 'Owner name');
        if (ownerNameError) newErrors.ownerName = ownerNameError;

        const addressError = requireMinLen10(form.address, 'Address');
        if (addressError) newErrors.address = addressError;

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

        if (form.deliveryRadius) {
            const radiusError = validatePositiveNumber(form.deliveryRadius, 'Delivery radius');
            if (radiusError) newErrors.deliveryRadius = radiusError;
        }

        priceList.forEach((row, index) => {
            if (row.service && !requireMinLen10(row.service, `Service ${index + 1}`)) {
                if (!row.price || parseFloat(row.price) <= 0) {
                    newErrors[`price_${index}`] = `Price must be greater than 0`;
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
            const validPriceList = priceList.filter(row => row.service && row.price && parseFloat(row.price) > 0);

            const { error } = await supabase.from('laundry_shops' as any).insert([{
                shop_name: form.shopName.trim(),
                owner_name: form.ownerName.trim(),
                address: form.address.trim(),
                city: form.city.trim() || null,
                phone: digitsOnlyPhone(form.phone),
                whatsapp: form.whatsapp ? digitsOnlyPhone(form.whatsapp) : null,
                delivery_radius: form.deliveryRadius ? parseFloat(form.deliveryRadius) : null,
                price_list: validPriceList,
                is_active: true,
                created_at: new Date().toISOString()
            } as any]);

            if (error) throw error;

            toast({ title: 'Laundry shop added successfully' });
            navigate('/admin/laundry');
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

    const addPriceRow = () => {
        setPriceList([...priceList, { service: '', price: '' }]);
    };

    const removePriceRow = (index: number) => {
        if (priceList.length > 1) {
            setPriceList(priceList.filter((_, i) => i !== index));
        }
    };

    const updatePriceRow = (index: number, field: keyof PriceRow, value: string) => {
        const updated = [...priceList];
        updated[index] = { ...updated[index], [field]: value };
        setPriceList(updated);
        if (errors[`price_${index}`]) setErrors(prev => ({ ...prev, [`price_${index}`]: '' }));
    };

    return (
        <form onSubmit={handleSubmit}>
            <AdminPageHero 
                title="Add Laundry Shop"
                description="Add a new laundry service to the campus"
                icon={<span className="text-white">L</span>}
            />
            <AdminPageStack>
                <AdminBackToDashboard to="/admin/laundry" />
                
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

                        <div className="space-y-2">
                            <Label>Delivery Radius (km)</Label>
                            <Input 
                                type="number"
                                step="0.1"
                                className={`rounded-xl border-gray-200 ${errors.deliveryRadius ? 'border-red-500' : ''}`}
                                placeholder="Enter delivery radius in km"
                                value={form.deliveryRadius}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, deliveryRadius: e.target.value }));
                                    if (errors.deliveryRadius) setErrors(prev => ({ ...prev, deliveryRadius: '' }));
                                }}
                            />
                            {errors.deliveryRadius && <p className="text-xs text-red-500">{errors.deliveryRadius}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-lg bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Price List</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {priceList.map((row, index) => (
                            <div key={index} className="flex gap-4 items-start">
                                <div className="flex-1 space-y-2">
                                    <Label>Service</Label>
                                    <Input 
                                        className="rounded-xl border-gray-200"
                                        placeholder="e.g. Wash & Fold (per kg)"
                                        value={row.service}
                                        onChange={(e) => updatePriceRow(index, 'service', e.target.value)}
                                    />
                                </div>
                                <div className="w-32 space-y-2">
                                    <Label>Price (₹)</Label>
                                    <Input 
                                        type="number"
                                        step="0.01"
                                        className={`rounded-xl border-gray-200 ${errors[`price_${index}`] ? 'border-red-500' : ''}`}
                                        placeholder="0.00"
                                        value={row.price}
                                        onChange={(e) => updatePriceRow(index, 'price', e.target.value)}
                                    />
                                </div>
                                <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="icon"
                                    className="mt-6"
                                    onClick={() => removePriceRow(index)}
                                    disabled={priceList.length === 1}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                        {Object.keys(errors).filter(k => k.startsWith('price_')).map(key => (
                            <p key={key} className="text-xs text-red-500">{errors[key]}</p>
                        ))}
                        <Button type="button" variant="outline" onClick={addPriceRow} className="rounded-xl">
                            <Plus className="h-4 w-4 mr-2" /> Add Service
                        </Button>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/laundry')} className="rounded-xl">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="rounded-xl gradient-primary">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Laundry Shop
                    </Button>
                </div>
            </AdminPageStack>
        </form>
    );
};

export default AdminLaundryAddForm;