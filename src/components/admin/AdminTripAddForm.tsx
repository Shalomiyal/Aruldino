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
import { 
    digitsOnlyPhone, 
    requireMinLen10, 
    minLen10IfPresent, 
    validatePositiveInt, 
    validatePositiveNumber,
    isValidEmail,
    localTodayISODate,
    validateDateNotPast,
    validateReturnOnOrAfterDeparture
} from '@/lib/admin/validation';

interface ItineraryDay {
    dayNumber: string;
    activity: string;
}

const AdminTripAddForm = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        destination: '',
        organizerName: '',
        description: '',
        inclusions: '',
        address: '',
        city: '',
        organizerEmail: '',
        phone: '',
        whatsapp: '',
        days: '',
        budget: '',
        maxParticipants: '',
        departureDate: '',
        returnDate: '',
    });

    const [itinerary, setItinerary] = useState<ItineraryDay[]>([
        { dayNumber: '1', activity: '' },
    ]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        const destError = requireMinLen10(form.destination, 'Destination');
        if (destError) newErrors.destination = destError;

        const organizerError = requireMinLen10(form.organizerName, 'Organizer name');
        if (organizerError) newErrors.organizerName = organizerError;

        const descError = requireMinLen10(form.description, 'Description');
        if (descError) newErrors.description = descError;

        const inclError = requireMinLen10(form.inclusions, 'Inclusions');
        if (inclError) newErrors.inclusions = inclError;

        const addrError = requireMinLen10(form.address, 'Address');
        if (addrError) newErrors.address = addrError;

        const cityError = minLen10IfPresent(form.city, 'City / area');
        if (cityError) newErrors.city = cityError;

        if (!isValidEmail(form.organizerEmail)) {
            newErrors.organizerEmail = 'Please enter a valid email address';
        }

        const phoneError = requireMinLen10(form.phone, 'Phone') || 
            (digitsOnlyPhone(form.phone).length !== 10 ? 'Phone must be exactly 10 digits' : null);
        if (phoneError) newErrors.phone = phoneError;

        if (form.whatsapp) {
            const whatsappDigits = digitsOnlyPhone(form.whatsapp);
            if (whatsappDigits.length !== 0 && whatsappDigits.length !== 10) {
                newErrors.whatsapp = 'WhatsApp must be exactly 10 digits if provided';
            }
        }

        const daysError = validatePositiveInt(form.days, 'Days');
        if (daysError) newErrors.days = daysError;

        const budgetError = validatePositiveNumber(form.budget, 'Budget');
        if (budgetError) newErrors.budget = budgetError;

        const participantsError = validatePositiveInt(form.maxParticipants, 'Max participants');
        if (participantsError) newErrors.maxParticipants = participantsError;

        const departureError = validateDateNotPast(form.departureDate, 'Departure date');
        if (departureError) newErrors.departureDate = departureError;

        const returnError = validateDateNotPast(form.returnDate, 'Return date');
        if (returnError) newErrors.returnDate = returnError;

        if (!newErrors.departureDate && !newErrors.returnDate) {
            const dateComparisonError = validateReturnOnOrAfterDeparture(form.departureDate, form.returnDate);
            if (dateComparisonError) newErrors.returnDate = dateComparisonError;
        }

        const validItineraryDays = itinerary.filter(d => d.dayNumber && d.activity);
        if (validItineraryDays.length === 0) {
            newErrors.itinerary = 'At least one day with activity is required';
        }

        itinerary.forEach((day, index) => {
            if (day.dayNumber && parseInt(day.dayNumber) <= 0) {
                newErrors[`itinerary_day_${index}`] = 'Day number must be greater than 0';
            }
            if (day.activity && !requireMinLen10(day.activity, `Activity ${index + 1}`)) {
                // valid
            } else if (day.activity) {
                newErrors[`itinerary_activity_${index}`] = `Activity must be at least 10 characters`;
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
            const validItinerary = itinerary.filter(d => d.dayNumber && d.activity && parseInt(d.dayNumber) > 0);

            const { error } = await supabase.from('trips' as any).insert([{
                destination: form.destination.trim(),
                organizer_name: form.organizerName.trim(),
                description: form.description.trim(),
                inclusions: form.inclusions.trim(),
                address: form.address.trim(),
                city: form.city.trim() || null,
                organizer_email: form.organizerEmail.trim(),
                phone: digitsOnlyPhone(form.phone),
                whatsapp: form.whatsapp ? digitsOnlyPhone(form.whatsapp) : null,
                days: parseInt(form.days),
                budget: parseFloat(form.budget),
                max_participants: parseInt(form.maxParticipants),
                departure_date: form.departureDate,
                return_date: form.returnDate,
                itinerary: validItinerary,
                is_active: true,
                created_at: new Date().toISOString()
            } as any]);

            if (error) throw error;

            toast({ title: 'Trip added successfully' });
            navigate('/admin/trips');
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

    const addItineraryDay = () => {
        setItinerary([...itinerary, { dayNumber: String(itinerary.length + 1), activity: '' }]);
    };

    const removeItineraryDay = (index: number) => {
        if (itinerary.length > 1) {
            setItinerary(itinerary.filter((_, i) => i !== index));
        }
    };

    const updateItineraryDay = (index: number, field: keyof ItineraryDay, value: string) => {
        const updated = [...itinerary];
        updated[index] = { ...updated[index], [field]: value };
        setItinerary(updated);
    };

    return (
        <form onSubmit={handleSubmit}>
            <AdminPageHero 
                title="Add Trip"
                description="Add a new trip to the campus"
                icon={<span className="text-white">T</span>}
            />
            <AdminPageStack>
                <AdminBackToDashboard to="/admin/trips" />
                
                <Card className="border border-gray-200 shadow-lg bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Trip Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Destination *</Label>
                                <Input 
                                    className={`rounded-xl border-gray-200 ${errors.destination ? 'border-red-500' : ''}`}
                                    placeholder="Enter destination (min 10 chars)"
                                    value={form.destination}
                                    onChange={(e) => {
                                        setForm(prev => ({ ...prev, destination: e.target.value }));
                                        if (errors.destination) setErrors(prev => ({ ...prev, destination: '' }));
                                    }}
                                />
                                {errors.destination && <p className="text-xs text-red-500">{errors.destination}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Organizer Name *</Label>
                                <Input 
                                    className={`rounded-xl border-gray-200 ${errors.organizerName ? 'border-red-500' : ''}`}
                                    placeholder="Enter organizer name (min 10 chars)"
                                    value={form.organizerName}
                                    onChange={(e) => {
                                        setForm(prev => ({ ...prev, organizerName: e.target.value }));
                                        if (errors.organizerName) setErrors(prev => ({ ...prev, organizerName: '' }));
                                    }}
                                />
                                {errors.organizerName && <p className="text-xs text-red-500">{errors.organizerName}</p>}
                            </div>
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
                            <Label>Inclusions *</Label>
                            <Input 
                                className={`rounded-xl border-gray-200 ${errors.inclusions ? 'border-red-500' : ''}`}
                                placeholder="Enter inclusions (min 10 chars)"
                                value={form.inclusions}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, inclusions: e.target.value }));
                                    if (errors.inclusions) setErrors(prev => ({ ...prev, inclusions: '' }));
                                }}
                            />
                            {errors.inclusions && <p className="text-xs text-red-500">{errors.inclusions}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Address *</Label>
                            <Input 
                                className={`rounded-xl border-gray-200 ${errors.address ? 'border-red-500' : ''}`}
                                placeholder="Enter address (min 10 chars)"
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
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-lg bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Contact & Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Organizer Email *</Label>
                                <Input 
                                    type="email"
                                    className={`rounded-xl border-gray-200 ${errors.organizerEmail ? 'border-red-500' : ''}`}
                                    placeholder="Enter valid email"
                                    value={form.organizerEmail}
                                    onChange={(e) => {
                                        setForm(prev => ({ ...prev, organizerEmail: e.target.value }));
                                        if (errors.organizerEmail) setErrors(prev => ({ ...prev, organizerEmail: '' }));
                                    }}
                                />
                                {errors.organizerEmail && <p className="text-xs text-red-500">{errors.organizerEmail}</p>}
                            </div>
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div className="space-y-2">
                                <Label>Number of Days *</Label>
                                <Input 
                                    type="number"
                                    className={`rounded-xl border-gray-200 ${errors.days ? 'border-red-500' : ''}`}
                                    placeholder="Enter number of days (> 0)"
                                    value={form.days}
                                    onChange={(e) => {
                                        setForm(prev => ({ ...prev, days: e.target.value }));
                                        if (errors.days) setErrors(prev => ({ ...prev, days: '' }));
                                    }}
                                />
                                {errors.days && <p className="text-xs text-red-500">{errors.days}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Budget (₹) *</Label>
                                <Input 
                                    type="number"
                                    step="0.01"
                                    className={`rounded-xl border-gray-200 ${errors.budget ? 'border-red-500' : ''}`}
                                    placeholder="Enter budget (> 0)"
                                    value={form.budget}
                                    onChange={(e) => {
                                        setForm(prev => ({ ...prev, budget: e.target.value }));
                                        if (errors.budget) setErrors(prev => ({ ...prev, budget: '' }));
                                    }}
                                />
                                {errors.budget && <p className="text-xs text-red-500">{errors.budget}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Max Participants *</Label>
                                <Input 
                                    type="number"
                                    className={`rounded-xl border-gray-200 ${errors.maxParticipants ? 'border-red-500' : ''}`}
                                    placeholder="Enter max participants (> 0)"
                                    value={form.maxParticipants}
                                    onChange={(e) => {
                                        setForm(prev => ({ ...prev, maxParticipants: e.target.value }));
                                        if (errors.maxParticipants) setErrors(prev => ({ ...prev, maxParticipants: '' }));
                                    }}
                                />
                                {errors.maxParticipants && <p className="text-xs text-red-500">{errors.maxParticipants}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Departure Date *</Label>
                                <Input 
                                    type="date"
                                    min={localTodayISODate()}
                                    className={`rounded-xl border-gray-200 ${errors.departureDate ? 'border-red-500' : ''}`}
                                    value={form.departureDate}
                                    onChange={(e) => {
                                        setForm(prev => ({ ...prev, departureDate: e.target.value }));
                                        if (errors.departureDate) setErrors(prev => ({ ...prev, departureDate: '' }));
                                    }}
                                />
                                {errors.departureDate && <p className="text-xs text-red-500">{errors.departureDate}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Return Date *</Label>
                                <Input 
                                    type="date"
                                    min={localTodayISODate()}
                                    className={`rounded-xl border-gray-200 ${errors.returnDate ? 'border-red-500' : ''}`}
                                    value={form.returnDate}
                                    onChange={(e) => {
                                        setForm(prev => ({ ...prev, returnDate: e.target.value }));
                                        if (errors.returnDate) setErrors(prev => ({ ...prev, returnDate: '' }));
                                    }}
                                />
                                {errors.returnDate && <p className="text-xs text-red-500">{errors.returnDate}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-lg bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Itinerary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {errors.itinerary && <p className="text-xs text-red-500 mb-2">{errors.itinerary}</p>}
                        {itinerary.map((day, index) => (
                            <div key={index} className="flex gap-4 items-start">
                                <div className="w-24 space-y-2">
                                    <Label>Day #</Label>
                                    <Input 
                                        type="number"
                                        className={`rounded-xl border-gray-200 ${errors[`itinerary_day_${index}`] ? 'border-red-500' : ''}`}
                                        placeholder="1"
                                        value={day.dayNumber}
                                        onChange={(e) => updateItineraryDay(index, 'dayNumber', e.target.value)}
                                    />
                                    {errors[`itinerary_day_${index}`] && <p className="text-xs text-red-500">{errors[`itinerary_day_${index}`]}</p>}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label>Activity</Label>
                                    <Input 
                                        className={`rounded-xl border-gray-200 ${errors[`itinerary_activity_${index}`] ? 'border-red-500' : ''}`}
                                        placeholder="Describe the activity for this day (min 10 chars)"
                                        value={day.activity}
                                        onChange={(e) => updateItineraryDay(index, 'activity', e.target.value)}
                                    />
                                    {errors[`itinerary_activity_${index}`] && <p className="text-xs text-red-500">{errors[`itinerary_activity_${index}`]}</p>}
                                </div>
                                <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="icon"
                                    className="mt-6"
                                    onClick={() => removeItineraryDay(index)}
                                    disabled={itinerary.length === 1}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addItineraryDay} className="rounded-xl">
                            <Plus className="h-4 w-4 mr-2" /> Add Day
                        </Button>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/trips')} className="rounded-xl">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="rounded-xl gradient-primary">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Trip
                    </Button>
                </div>
            </AdminPageStack>
        </form>
    );
};

export default AdminTripAddForm;