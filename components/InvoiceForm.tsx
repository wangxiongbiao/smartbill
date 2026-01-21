import { translations } from '@/shared/i18n';
import { DocumentType, Invoice, InvoiceItem, Language } from '@/shared/types';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { TouchableOpacity } from 'react-native-gesture-handler';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';

interface InvoiceFormProps {
    invoice: Invoice;
    onChange: (updates: Partial<Invoice>) => void;
    lang: Language;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onChange, lang }) => {
    const signatureRef = useRef<SignatureViewRef>(null);
    const t = translations[lang] || translations['en'];

    const handleSignature = (signature: string) => {
        onChange({ sender: { ...invoice.sender, signature } });
    };

    const handleEmpty = () => {
        onChange({ sender: { ...invoice.sender, signature: undefined } });
    };

    const clearSignature = () => {
        signatureRef.current?.clearSignature();
        handleEmpty();
    };

    const handleEnd = () => {
        signatureRef.current?.readSignature();
    };

    const addItem = () => {
        const id = `item-${Date.now()}`;
        const newItem: InvoiceItem = {
            id,
            description: '',
            quantity: '',
            rate: ''
        };
        onChange({ items: [...invoice.items, newItem] });
    };

    const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
        const newItems = invoice.items.map(item =>
            item.id === id ? { ...item, ...updates } : item
        );
        onChange({ items: newItems });
    };

    const removeItem = (id: string) => {
        onChange({ items: invoice.items.filter(item => item.id !== id) });
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            onChange({ sender: { ...invoice.sender, logo: `data:image/jpeg;base64,${result.assets[0].base64}` } });
        }
    };

    const renderItem = ({ item, drag, isActive }: RenderItemParams<InvoiceItem>) => {
        return (
            <ScaleDecorator>
                <TouchableOpacity
                    onLongPress={drag}
                    disabled={isActive}
                    className={`bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3 ${isActive ? 'bg-blue-50 border-blue-300' : ''}`}
                >
                    <View className="flex-row justify-between items-center mb-2">
                        <TextInput
                            placeholder={t.itemDesc}
                            className="flex-1 bg-transparent font-medium text-base text-slate-900"
                            value={item.description}
                            onChangeText={(text) => updateItem(item.id, { description: text })}
                        />
                        <TouchableOpacity onPress={() => removeItem(item.id)} className="p-2">
                            <Text className="text-red-500 font-bold">✕</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Text className="text-[10px] font-bold text-slate-400 mb-1">{t.quantity}</Text>
                            <TextInput
                                keyboardType="numeric"
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm"
                                value={String(item.quantity)}
                                onChangeText={(text) => updateItem(item.id, { quantity: text === '' ? '' : Number(text) })}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] font-bold text-slate-400 mb-1">{t.rate}</Text>
                            <TextInput
                                keyboardType="numeric"
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm"
                                value={String(item.rate)}
                                onChangeText={(text) => updateItem(item.id, { rate: text === '' ? '' : Number(text) })}
                            />
                        </View>
                        <View className="flex-1 items-end justify-end">
                            <Text className="text-[10px] font-bold text-slate-400 mb-1">{t.amount}</Text>
                            <Text className="font-bold py-2 text-slate-900">
                                {(Number(item.quantity || 0) * Number(item.rate || 0)).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    };

    return (
        <ScrollView className="bg-white" contentContainerClassName="p-4 bg-white" scrollEnabled={true}>
            <View className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-6">
                {/* Document Type Selector */}
                <View className="flex-row bg-slate-100 p-1 rounded-xl mb-4">
                    {(['invoice', 'receipt'] as DocumentType[]).map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => onChange({ type })}
                            className={`flex-1 py-2 items-center rounded-lg ${invoice.type === type ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`font-bold ${invoice.type === type ? 'text-blue-600' : 'text-slate-500'}`}>
                                {type === 'invoice' ? t.invoiceMode : t.receiptMode}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Invoice Number & Currency */}
                <View className="flex-row gap-4 mb-4">
                    <View className="flex-1 space-y-2">
                        <Text className="text-sm font-semibold text-slate-700">{invoice.type === 'invoice' ? t.invNo : t.recNo}</Text>
                        <TextInput
                            value={invoice.invoiceNumber}
                            onChangeText={(text) => onChange({ invoiceNumber: text })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                    </View>
                </View>

                {/* Bill From / To */}
                <View className="space-y-4 border-t border-slate-100 pt-4 mb-4">
                    <View className="space-y-4">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-xs font-bold uppercase text-slate-400">{t.billFrom}</Text>
                            <TouchableOpacity onPress={pickImage}>
                                <Text className="text-xs text-blue-600 font-bold">{t.logoUp}</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            placeholder={t.namePlaceholder}
                            value={invoice.sender.name}
                            onChangeText={(text) => onChange({ sender: { ...invoice.sender, name: text } })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                        <TextInput
                            placeholder={t.addrPlaceholder}
                            value={invoice.sender.address}
                            onChangeText={(text) => onChange({ sender: { ...invoice.sender, address: text } })}
                            multiline
                            numberOfLines={3}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20 text-start"
                            textAlignVertical="top"
                        />
                    </View>

                    <View className="space-y-4">
                        <Text className="text-xs font-bold uppercase text-slate-400">{t.billTo}</Text>
                        <TextInput
                            placeholder={t.clientName}
                            value={invoice.client.name}
                            onChangeText={(text) => onChange({ client: { ...invoice.client, name: text } })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                        <TextInput
                            placeholder={t.clientAddr}
                            value={invoice.client.address}
                            onChangeText={(text) => onChange({ client: { ...invoice.client, address: text } })}
                            multiline
                            numberOfLines={3}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20"
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Items List */}
                <View className="mb-4">
                    <Text className="text-xs font-bold uppercase text-slate-400 mb-2">{t.items}</Text>
                    {/* DraggableList requires a fixed height or flex context, but inside ScrollView it needs careful handling. 
               However, DraggableFlatList in a ScrollView is generally discouraged. 
               For MVP, we use the list but might disable scrolling of the parent when dragging?
               Actually, DraggableFlatList handles its own scrolling. 
               Putting it inside a ScrollView throws a warning "VirtualisedLists should never be nested".
               Refactoring: The main InvoiceForm should ideally be the FlatList itself.
               But we have header and footer content.
               Solution: Use DraggableFlatList with ListHeaderComponent and ListFooterComponent.
           */}
                    {/* For now, simplified view: standard map (no drag) OR properly implement header/footer.
               Let's try standard map first for safety, user asked specifically for DnD replacement though.
               Okay, I will refactor this entire component to be a DraggableFlatList.
           */}
                </View>
            </View>
        </ScrollView>
    );
};

// Refactoring to DraggableFlatList as the root component
const InvoiceFormList: React.FC<InvoiceFormProps> = ({ invoice, onChange, lang }) => {
    const signatureRef = useRef<SignatureViewRef>(null);
    const t = translations[lang] || translations['en'];

    const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
        const newItems = invoice.items.map(item =>
            item.id === id ? { ...item, ...updates } : item
        );
        onChange({ items: newItems });
    };

    const removeItem = (id: string) => {
        onChange({ items: invoice.items.filter(item => item.id !== id) });
    };

    const renderItem = ({ item, drag, isActive }: RenderItemParams<InvoiceItem>) => {
        return (
            <ScaleDecorator>
                <TouchableOpacity
                    onLongPress={drag}
                    disabled={isActive}
                    className={`bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3 mx-4 ${isActive ? 'bg-blue-50 border-blue-300' : ''}`}
                >
                    <View className="flex-row justify-between items-center mb-2">
                        {/* Using onTouchStart on inputs inside draggable might be tricky, but ScaleDecorator helps */}
                        <TextInput
                            placeholder={t.itemDesc}
                            className="flex-1 bg-transparent font-medium text-base text-slate-900"
                            value={item.description}
                            onChangeText={(text) => updateItem(item.id, { description: text })}
                        />
                        <TouchableOpacity onPress={() => removeItem(item.id)} className="p-2">
                            <Text className="text-red-500 font-bold">✕</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Text className="text-[10px] font-bold text-slate-400 mb-1">{t.quantity}</Text>
                            <TextInput
                                keyboardType="numeric"
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm"
                                value={String(item.quantity)}
                                onChangeText={(text) => updateItem(item.id, { quantity: text === '' ? '' : Number(text) })}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] font-bold text-slate-400 mb-1">{t.rate}</Text>
                            <TextInput
                                keyboardType="numeric"
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm"
                                value={String(item.rate)}
                                onChangeText={(text) => updateItem(item.id, { rate: text === '' ? '' : Number(text) })}
                            />
                        </View>
                        <View className="flex-1 items-end justify-end">
                            <Text className="text-[10px] font-bold text-slate-400 mb-1">{t.amount}</Text>
                            <Text className="font-bold py-2 text-slate-900">
                                {(Number(item.quantity || 0) * Number(item.rate || 0)).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    };

    const addItem = () => {
        const id = `item-${Date.now()}`;
        const newItem: InvoiceItem = { id, description: '', quantity: '', rate: '' };
        onChange({ items: [...invoice.items, newItem] });
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
            base64: true,
        });
        if (!result.canceled && result.assets[0].base64) {
            onChange({ sender: { ...invoice.sender, logo: `data:image/jpeg;base64,${result.assets[0].base64}` } });
        }
    };

    const handleSignature = (signature: string) => {
        onChange({ sender: { ...invoice.sender, signature } });
    };

    const clearSignature = () => {
        signatureRef.current?.clearSignature();
        onChange({ sender: { ...invoice.sender, signature: undefined } });
    };

    const renderHeader = () => (
        <View className="p-4 space-y-6 bg-white">
            <View className="flex-row bg-slate-100 p-1 rounded-xl mb-4">
                {(['invoice', 'receipt'] as DocumentType[]).map((type) => (
                    <TouchableOpacity
                        key={type}
                        onPress={() => onChange({ type })}
                        className={`flex-1 py-2 items-center rounded-lg ${invoice.type === type ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${invoice.type === type ? 'text-blue-600' : 'text-slate-500'}`}>
                            {type === 'invoice' ? t.invoiceMode : t.receiptMode}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View className="space-y-4">
                <Text className="text-sm font-semibold text-slate-700">{invoice.type === 'invoice' ? t.invNo : t.recNo}</Text>
                <TextInput
                    value={invoice.invoiceNumber}
                    onChangeText={(text) => onChange({ invoiceNumber: text })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
            </View>

            <View className="space-y-4 border-t border-slate-100 pt-4">
                <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-bold uppercase text-slate-400">{t.billFrom}</Text>
                    <TouchableOpacity onPress={pickImage}>
                        <Text className="text-xs text-blue-600 font-bold">{t.logoUp}</Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    placeholder={t.namePlaceholder}
                    value={invoice.sender.name}
                    onChangeText={(text) => onChange({ sender: { ...invoice.sender, name: text } })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
                <TextInput
                    placeholder={t.addrPlaceholder}
                    value={invoice.sender.address}
                    onChangeText={(text) => onChange({ sender: { ...invoice.sender, address: text } })}
                    multiline numberOfLines={3}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20"
                    textAlignVertical="top"
                />
            </View>

            <View className="space-y-4 pt-4">
                <Text className="text-xs font-bold uppercase text-slate-400">{t.billTo}</Text>
                <TextInput
                    placeholder={t.clientName}
                    value={invoice.client.name}
                    onChangeText={(text) => onChange({ client: { ...invoice.client, name: text } })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
                <TextInput
                    placeholder={t.clientAddr}
                    value={invoice.client.address}
                    onChangeText={(text) => onChange({ client: { ...invoice.client, address: text } })}
                    multiline numberOfLines={3}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20"
                    textAlignVertical="top"
                />
            </View>

            <View className="pt-4 border-t border-slate-100">
                <Text className="text-xs font-bold uppercase text-slate-400 mb-2">{t.items}</Text>
            </View>
        </View>
    );

    const renderFooter = () => (
        <View className="p-4 space-y-6 bg-white pb-20">
            <TouchableOpacity onPress={addItem} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl items-center mb-6">
                <Text className="text-slate-400 font-bold text-sm">{t.addItems}</Text>
            </TouchableOpacity>

            <View className="flex-row justify-between items-center">
                <Text className="text-sm font-semibold text-slate-700">{t.taxRate}</Text>
                <TextInput
                    keyboardType="numeric"
                    className="w-20 px-3 py-1 bg-white border border-slate-200 rounded-lg text-right text-sm"
                    value={String(invoice.taxRate)}
                    onChangeText={(text) => onChange({ taxRate: Number(text) })}
                />
            </View>

            <View className="bg-blue-600 p-4 rounded-xl flex-row justify-between items-center">
                <Text className="font-bold uppercase text-xs text-white">{t.payable}</Text>
                <Text className="text-2xl font-black text-white">
                    {(invoice.items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.rate || 0)), 0) * (1 + invoice.taxRate / 100)).toFixed(2)}
                </Text>
            </View>

            <View className="space-y-3 pt-4">
                <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-bold uppercase text-slate-400">{t.signature}</Text>
                    <TouchableOpacity onPress={clearSignature}>
                        <Text className="text-[10px] font-bold text-blue-600 uppercase">{t.signClear}</Text>
                    </TouchableOpacity>
                </View>
                <View className="h-[150px] border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                    <SignatureScreen
                        ref={signatureRef}
                        onOK={handleSignature}
                        webStyle={`.m-signature-pad--footer {display: none; margin: 0px;} body {background-color: transparent;} .m-signature-pad {box-shadow: none; border: none; background-color: transparent;}`}
                        backgroundColor="transparent"
                        descriptionText={t.signPlaceholder}
                    />
                </View>
            </View>
        </View>
    );

    return (
        <DraggableFlatList
            data={invoice.items}
            onDragEnd={({ data }) => onChange({ items: data })}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            contentContainerStyle={{ paddingBottom: 100, backgroundColor: 'white' }}
        />
    );
};

export default InvoiceFormList;
