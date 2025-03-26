(() => {

    const serverUrl = 'http://localhost:3000/api/clients';
    const clientsTable = document.querySelector('.table__body');

    let sortDirection = 1;
    let sortField = document.querySelector('.table__header-filter_active');
    let timeout;

    // Работа с сервером
    const serverController = {

        async getClientsData(id = '') {
            const response = await fetch(serverUrl + '/' + id);
            const clientsList = await response.json();
            return clientsList
        },
        async searchClientData(param) {
            const searchUrl = new URL(serverUrl);
            searchUrl.searchParams.set('search', param);
            const response = await fetch(searchUrl);
            const foundClient = await response.json();
            return foundClient
        },
        async addAndChangeClientData(method, responseParam, clientItem) {
            if (method == 'POST') {
                const response = await fetch(serverUrl, responseParam)
                return response.status
            } else {
                const response = await fetch(serverUrl + '/' + clientItem.id, responseParam)
                return response.status
            }
        },
        async deleteClientData(clientItem) {
            const response = await fetch(serverUrl + '/' + clientItem.id, {
                method: 'DELETE',
            })
        },
    }

    // Создание элемента студента
    function createClientElement(clientObj) {
        const clientTr = document.createElement('tr');
        const clientIdTd = document.createElement('td');
        const clientFullnameTd = document.createElement('td');
        const createDateTd = document.createElement('td');
        const createTimeSpan = document.createElement('span');
        const changeDateTd = document.createElement('td');
        const changeTimeSpan = document.createElement('span');
        const contactsTd = document.createElement('td');
        const buttonsTd = document.createElement('td');
        const changeButton = document.createElement('button');
        const deleteButton = document.createElement('button');

        clientTr.classList.add('table__row');
        clientIdTd.classList.add('table__cell', 'table__data-light');
        clientFullnameTd.classList.add('table__cell');
        createDateTd.classList.add('table__cell');
        createTimeSpan.classList.add('table__data-light', 'table__data-big', 'table__data-time');
        changeDateTd.classList.add('table__cell');
        changeTimeSpan.classList.add('table__data-light', 'table__data-big', 'table__data-time');
        contactsTd.classList.add('table__cell');
        buttonsTd.classList.add('table__cell');
        changeButton.classList.add('button', 'table__button', 'table__button_change');
        deleteButton.classList.add('button', 'table__button', 'table__button_delete');

        const createDate = formatDate(clientObj.createdAt);
        const changeDate = formatDate(clientObj.updatedAt);
        const contactsList = createContactsElement(clientObj);


        clientIdTd.innerHTML = clientObj.id;
        clientFullnameTd.innerHTML = clientObj.surname + ' ' + clientObj.name + ' ' + clientObj.lastName;
        createTimeSpan.innerHTML = createDate.formattedTime;
        createDateTd.innerHTML = createDate.formattedDate;
        changeTimeSpan.innerHTML = changeDate.formattedTime;
        changeDateTd.innerHTML = changeDate.formattedDate;
        changeButton.innerHTML = ' <svg  width="16" height="16" viewBox="0 0 16 16"><use xlink:href="img/sprite.svg#сhange-btn"></use></svg>Изменить'
        deleteButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16"><use xlink:href="img/sprite.svg#delete-btn"></use></svg>Удалить'

        changeButton.addEventListener('click', () => {
            сontrolChangeModal(clientObj, clientTr);
        })

        deleteButton.addEventListener('click', () => {
            сontrolDeleteModal(clientObj, clientTr);
        })


        createDateTd.append(createTimeSpan);
        changeDateTd.append(changeTimeSpan);
        contactsTd.append(contactsList);
        contactsTd.append(contactsList);
        buttonsTd.append(changeButton, deleteButton);
        clientTr.append(clientIdTd, clientFullnameTd, createDateTd, changeDateTd, contactsTd, buttonsTd);

        return {
            clientTr,
            clientIdTd,
            clientFullnameTd,
            createDateTd,
            changeDateTd,
            contactsTd,
            buttonsTd,
        }
    }

    // Отрисовка всей таблицы
    function renderClienstTable(clientsArr) {
        clientsTable.innerHTML = '';
        clientsArr.forEach(element => {
            const clientElement = createClientElement(element);
            clientsTable.append(clientElement.clientTr);
        })
    }

    // Преобразовать дату для отображения в таблице
    function formatDate(date) {
        const formattedDate = date.slice(0, 10).split('-').reverse().join('.');
        const formattedTime = date.slice(11, 16);

        return {
            formattedDate,
            formattedTime
        }
    }

    // Конвертировать строку в дату
    function convertStringToDate(string) {
        return new Date(string.slice(0, 10).split('.').reverse().join('-') + 'T' + string.slice(10, 16));
    }

    // Cоздать элемент контактов 
    function createContactsElement(clientObj) {
        const contactsUl = document.createElement('ul');
        contactsUl.classList.add('list-reset', 'table__contacts-list');
        const contactsArr = [];

        // Создание элемента списка контактов
        for (let element of clientObj.contacts) {

            const contactsLi = document.createElement('li');
            contactsLi.classList.add('table__contacts-item');

            // Cоздание тултипа
            const tooltipElement = document.createElement('div');
            const tolltipContactValue = document.createElement('span');
            const tolltipContactText = document.createElement('span');

            tooltipElement.classList.add('table__contacts-tooltip', 'tooltip');
            tolltipContactValue.classList.add('table__contacts-tooltip_thin');

            tooltipElement.append(tolltipContactValue, tolltipContactText);
            tolltipContactValue.innerHTML = `${element.type}: `;
            tolltipContactText.innerHTML = element.value;

            contactsLi.addEventListener('mouseover', () => {
                tooltipElement.classList.add('table__contacts-tooltip_active');
            })

            contactsLi.addEventListener('mouseout', () => {
                tooltipElement.classList.remove('table__contacts-tooltip_active')
            })

            // Присваиваем иконку в зависимости от типа контакта
            function createSvgLink(svgName) {
                if (svgName == 'Телефон') svgName = 'phone';
                if (svgName == 'Другое') svgName = 'other';
                const svgNameLowerCase = svgName.toLowerCase();
                return `<svg  width="16" height="16" viewBox="0 0 16 16"><use xlink:href="img/sprite.svg#${svgNameLowerCase}"></use></svg >`
            }
            const linkName = createSvgLink(element.type);
            contactsLi.innerHTML = linkName;
            contactsLi.append(tooltipElement)

            contactsArr.push(contactsLi);
            contactsUl.append(contactsLi);
        }

        if (contactsArr.length > 5) {

            // Дать "лишним" элементам dispay none
            const hiddenContacstCount = (contactsArr.length - 4)
            const hiddenContacts = contactsArr.splice(4, hiddenContacstCount);

            for (let element of hiddenContacts) {
                element.classList.add('table__contacts-item-hidden');
            }

            // кнопка "показать еще"
            const contactsLi = document.createElement('li');
            const showContactsButton = document.createElement('button');
            showContactsButton.textContent = `+${hiddenContacstCount}`;
            showContactsButton.classList.add('button', 'table__contacts-button')

            showContactsButton.addEventListener('click', (e) => {
                for (let element of hiddenContacts) {
                    element.classList.add('table__contacts-item-visible');
                    element.classList.remove('table__contacts-item-hidden');
                };
                e.target.closest('TD').classList.add('table__cell_contacts-open');
                showContactsButton.classList.add('table__contacts-button-hidden');
            });

            contactsLi.append(showContactsButton);
            contactsUl.append(contactsLi);
        }

        return contactsUl
    }

    // Cортировка таблицы
    function sortClients(dataType, columnNumber) {

        let tableRows = [...clientsTable.rows];

        switch (dataType) {
            case 'number':
                tableRows = tableRows.sort((a, b) => {
                    const numA = Number(a.cells[columnNumber].innerHTML);
                    const numB = Number(b.cells[columnNumber].innerHTML);
                    return (numA - numB) * sortDirection
                });
                break
            case 'string':
                tableRows = tableRows.sort((a, b) => a.cells[columnNumber].innerHTML > b.cells[columnNumber].innerHTML ? sortDirection : -1 * sortDirection);
                break
            case 'date':
                tableRows = tableRows.sort((a, b) => {
                    const dateA = convertStringToDate(a.cells[columnNumber].textContent).getTime();
                    const dateB = convertStringToDate(b.cells[columnNumber].textContent).getTime();
                    return (dateA - dateB) * sortDirection
                });
                break
        }

        clientsTable.append(...tableRows)
    }

    // Обработка события при сортировке и декорирование элементов
    function initSortClients(e) {
        const targetTh = e.target.closest('TH');

        if (!targetTh.classList.contains('table__header-filter')) return

        const columnNumber = targetTh.cellIndex;
        const dataType = targetTh.getAttribute('data-type');

        const filterTextDirection = targetTh.querySelector('.table__header-filter-direction')

        // Направление сортировки и декорация элементов
        if (sortField == targetTh) {
            sortDirection *= -1;

            targetTh.querySelector('SVG').classList.toggle('table__header-arrow-active');
            if (filterTextDirection !== null) {
                if (sortDirection > 0) {
                    filterTextDirection.textContent = 'А-Я'
                } else {
                    filterTextDirection.textContent = 'Я-А'
                }
            }
        } else {
            sortDirection = 1;

            sortField.querySelector('SVG').classList.remove('table__header-arrow-active');
            sortField.classList.remove('table__header-filter_active');
            targetTh.querySelector('SVG').classList.add('table__header-arrow-active');
            targetTh.classList.add('table__header-filter_active');
            document.querySelector('.table__header-filter-direction').textContent = 'А-Я';

            sortField = targetTh;
        }

        sortClients(dataType, columnNumber);
    }

    // Поиск 
    async function searchClient() {
        const searchRequest = document.querySelector('.header__search').value;
        if (searchRequest == '') {
            const clientsArr = await serverController.getClientsData();
            renderClienstTable(clientsArr);
        }
        const foundClient = await serverController.searchClientData(searchRequest);
        renderClienstTable(foundClient);
    }

    // Модальное окно изменения
    async function сontrolChangeModal(clientObj, clientTr) {

        const clientData = await (serverController.getClientsData(clientObj.id));

        const modalElement = createModalElement('Изменить данные', 'Сохранить', 'Удалить клиента');
        const modalForm = createModalInputs('change');
        const modalAddContactBtn = createModalContactButton();
        modalElement.modalBox.setAttribute('data-simplebar', '');

        const modalId = document.createElement('span');
        modalId.classList.add('modal__id');
        modalId.textContent = `ID: ${clientData.id}`;
        modalElement.modalHeader.append(modalId);

        modalForm.modalBottomWrapper.append(modalElement.submitModalBtn, modalElement.cancelModalBtn);
        modalElement.modalForm.append(modalForm.modalTopWrapper, modalAddContactBtn.modalMiddleWrapper, modalForm.modalBottomWrapper);
        modalElement.modalBox.append(modalElement.modalHeader, modalElement.modalForm);
        document.body.append(modalElement.modal);

        modalForm.modalNameInput.value = clientData.name;
        modalForm.modalSurnameInput.value = clientData.surname;
        modalForm.modalLastnameInput.value = clientData.lastName;

        clientData.contacts.forEach(contact => {
            const contactField = createContantFieldElement(modalAddContactBtn);
            contactField.input.value = contact.value;
            contactField.choices.setChoiceByValue([contact.type])
        })

        // Добавление поля контактов
        modalAddContactBtn.modalAddContactBtn.addEventListener('click', () => {
            createContantFieldElement(modalAddContactBtn)
        });

        openModal();

        // Установка обработчиков закрытия форм
        closeModalListener();

        // Удаление клиента
        document.querySelector('.form__cancel-btn').addEventListener('click', () => {
            closeModal();
            setTimeout(() => сontrolDeleteModal(clientObj, clientTr), 400);
        })

        modalElement.modalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const sendForm = modalValidation();
            if (!sendForm) return
            const formatData = formatClientData();
            const editedClientObj = createClientObj(formatData.formatName, formatData.formatSurname, formatData.formatLastname, formatData.formatContacts);
            editedClientObj.id = clientObj.id;
            const responseStatus = await addAndChangeClient(editedClientObj, 'PATCH');
            if (responseStatus) {
                const clientsArr = await serverController.getClientsData();
                renderClienstTable(clientsArr);
                sortClients('number', 0);
            }
            closeModal();
        })
    }

    // Модальное окно добавления 
    function controlAddModal() {
        const modalElement = createModalElement('Новый клиент', 'Сохранить', 'Отмена');
        const modalForm = createModalInputs('add');
        const modalAddContactBtn = createModalContactButton();

        modalElement.modalBox.setAttribute('data-simplebar', '');
        modalForm.modalBottomWrapper.append(modalElement.submitModalBtn, modalElement.cancelModalBtn);
        modalElement.modalForm.append(modalForm.modalTopWrapper, modalAddContactBtn.modalMiddleWrapper, modalForm.modalBottomWrapper);
        modalElement.modalBox.append(modalElement.modalHeader, modalElement.modalForm);
        document.body.append(modalElement.modal);

        openModal();

        // Установка обработчиков закрытия форм
        closeModalListener();

        // Отображение/скрытие плейсхолдеров при вводе
        const inputElements = document.querySelectorAll('.form__input');
        const placeholderElements = document.querySelectorAll('.form__placeholder');

        for (let i = 0; i < inputElements.length; i++) {
            inputElements[i].addEventListener('input', (e) => {
                placeholderElements[i].style.display = (e.target.value == '') ? 'inline' : 'none'
            })
        };

        // Закрытие формы при нажатии кнопки отмены
        document.querySelector('.form__cancel-btn').addEventListener('click', closeModal, { once: true });


        // Добавление поля контактов
        modalAddContactBtn.modalAddContactBtn.addEventListener('click', () => {
            createContantFieldElement(modalAddContactBtn)
        });

        modalElement.modalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const sendForm = modalValidation();
            if (!sendForm) return
            const formatData = formatClientData();
            const clientObj = createClientObj(formatData.formatName, formatData.formatSurname, formatData.formatLastname, formatData.formatContacts);
            const responseStatus = await addAndChangeClient(clientObj, 'POST');
            if (responseStatus) {
                const clientsArr = await serverController.getClientsData();
                renderClienstTable(clientsArr);
            }
            closeModal();
        })
    }

    // Отрисовка поля контакта при нажатии на кнопку "добавить контакт"
    function createContantFieldElement(modalAddContactBtn) {
        const contactInputCount = document.querySelectorAll('.form__contact').length;
        if (contactInputCount >= 9) modalAddContactBtn.modalAddContactBtn.classList.add('form__add-btn_hidden');

        const contactInput = createContactInput();
        const select = contactInput.modalSelect;
        const input = contactInput.modalContactInput;
        modalAddContactBtn.modalMiddleWrapper.classList.add('form__middle_with-contacts');

        modalAddContactBtn.modalContactsWrapper.append(contactInput.modalContactWrapper);

        // choices для декорации селекта
        const choices = new Choices(select, {
            searchEnabled: false,
            itemSelectText: '',
            removeItems: true,
        })
        return {
            choices,
            select,
            input
        }
    }

    // Валидация формы
    function modalValidation() {

        let sendForm = true;

        const errorElement = document.querySelectorAll('.form__error');
        errorElement.forEach(el => el.remove());

        const name = document.querySelector('#name');
        const surname = document.querySelector('#surname');
        const contactFields = document.querySelectorAll('.form__contact-input');

        contactFields.forEach(el => {
            if (el.value.trim() == '') {
                sendForm = false;
                errorHandler(el);
            }
        })

        if (name.value.trim() == '') {
            sendForm = false;
            errorHandler(name);
        }

        if (surname.value.trim() == '') {
            sendForm = false;
            errorHandler(surname);
        }

        if (!sendForm) {
            createErrorElement('Заполните пустые поля');
        }

        return sendForm
    }

    // Cоздать описание ошибки
    function createErrorElement(text) {
        const errorElement = document.createElement('div');
        errorElement.classList.add('form__error');
        errorElement.textContent = text;
        document.querySelector('.form__bottom').prepend(errorElement);
    }

    // Подсветка ошибки при заполнении формы
    function errorHandler(field) {
        field.classList.add('form__input-error');
        field.addEventListener('input', () => field.classList.remove('form__input-error'));
    }

    // Привeдение данных из полей формы в единый формат 
    function formatClientData() {
        const name = document.querySelector('#name').value.trim();
        const surname = document.querySelector('#surname').value.trim();
        const lastName = document.querySelector('#lastName').value.trim();
        const contactFields = document.querySelectorAll('.form__contact');
        const formatContacts = [];

        contactFields.forEach(el => {
            const contactType = el.querySelector('select').value;
            const contactValue = el.querySelector('input').value;

            formatContacts.push({
                'type': contactType,
                'value': contactValue,
            })

        })

        const formatName = (name.slice(0, 1)).toUpperCase() + (name.slice(1)).toLowerCase();
        const formatSurname = (surname.slice(0, 1)).toUpperCase() + (surname.slice(1)).toLowerCase();
        const formatLastname = (lastName.slice(0, 1)).toUpperCase() + (lastName.slice(1)).toLowerCase();

        return {
            formatName,
            formatSurname,
            formatLastname,
            formatContacts,
        }
    }

    // Cоздание объекта из данных формы
    function createClientObj(name, surname, lastName, contacts) {
        const clientObj = {
            name: name,
            surname: surname,
            lastName: lastName,
            contacts: contacts,
        }
        return clientObj
    }

    // Добавление/измение клиента на сервере
    async function addAndChangeClient(clientObj, method) {
        const stringifyData = JSON.stringify({
            name: clientObj.name,
            surname: clientObj.surname,
            lastName: clientObj.lastName,
            contacts: clientObj.contacts
        });
        const responseParam = {
            method: method,
            body: stringifyData,
            headers: {
                'Content-Type': 'application/json',
            }
        }
        const response = await serverController.addAndChangeClientData(method, responseParam, clientObj);
        if (response.status == 200 || 201) {
            return true
        } else {
            createErrorElement('Что-то пошло не так...');
        }
    }

    // Модальное окно удаления
    function сontrolDeleteModal(clientObj, clientTr) {

        const modalElement = createModalElement('Удалить клиента', 'Удалить', 'Отмена');
        modalElement.modalHeader.classList.add('modal__title-delete');
        modalElement.modalBox.classList.add('modal-delete__box');
        modalElement.modalForm.classList.add('modal__form-delete')
        const modalText = document.createElement('div');
        modalText.classList.add('modal__text');
        modalText.textContent = 'Вы действительно хотите удалить данного клиента?';

        modalElement.modalForm.append(modalElement.submitModalBtn, modalElement.cancelModalBtn);
        modalElement.modalBox.append(modalElement.modalHeader, modalText, modalElement.modalForm);
        document.body.append(modalElement.modal);

        openModal();
        // Установка обработчиков закрытия форм
        closeModalListener();

        // Закрытие формы при нажатии кнопки отмены
        modalElement.cancelModalBtn.addEventListener('click', closeModal, { once: true });

        modalElement.modalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            deleteClient(clientObj, clientTr);
        })
    }

    // Удаление клиента с сервера
    function deleteClient(clientObj, clientTr) {
        serverController.deleteClientData(clientObj);
        closeModal();
        clientTr.remove();
    }


    // Отрисовка элемента модального окна
    function createModalElement(modalName, submitText, cancelText) {

        const modal = document.createElement('div');
        const modalBox = document.createElement('div');
        const modalHeader = document.createElement('h2');
        const modalForm = document.createElement('form');
        const closeModalBtn = document.createElement('button');
        const submitModalBtn = document.createElement('button');
        const cancelModalBtn = document.createElement('button');

        modal.classList.add('modal');
        modalBox.classList.add('modal__box');
        modalHeader.classList.add('modal__title');
        modalForm.classList.add('form', 'modal__form');
        closeModalBtn.classList.add('button', 'modal__close-btn');
        submitModalBtn.classList.add('button', 'form__save-btn');
        cancelModalBtn.classList.add('button', 'form__cancel-btn');

        modalHeader.textContent = modalName;
        closeModalBtn.innerHTML = '<svg width="17" height="17" viewBox="0 0 17 17"><use xlink:href="img/sprite.svg#close-modal"></use></svg>'
        submitModalBtn.textContent = submitText;
        cancelModalBtn.textContent = cancelText;

        submitModalBtn.type = 'submit';
        cancelModalBtn.type = 'button';

        modalBox.append(closeModalBtn);
        modal.append(modalBox);

        return {
            modal,
            modalBox,
            modalHeader,
            modalForm,
            closeModalBtn,
            submitModalBtn,
            cancelModalBtn,
        }
    }

    // Отрисовка инпутов в модальном окне
    function createModalInputs(modalType) {

        const modalTopWrapper = document.createElement('div');
        const modalNameWrapper = document.createElement('div');
        const modalSurnameWrapper = document.createElement('div');
        const modalLastnameWrapper = document.createElement('div');
        const modalBottomWrapper = document.createElement('div');
        const modalNameInput = document.createElement('input');
        const modalSurnameInput = document.createElement('input');
        const modalLastnameInput = document.createElement('input');
        const placeholderNameRequired = document.createElement('span');
        const placeholderSurnameRequired = document.createElement('span');

        modalTopWrapper.classList.add('form__top');
        modalNameWrapper.classList.add('form__item');
        modalSurnameWrapper.classList.add('form__item');
        modalLastnameWrapper.classList.add('form__item');
        modalBottomWrapper.classList.add('form__bottom');
        modalNameInput.classList.add('form__input');
        modalSurnameInput.classList.add('form__input');
        modalLastnameInput.classList.add('form__input');

        modalNameInput.type = 'text';
        modalSurnameInput.type = 'text';
        modalLastnameInput.type = 'text';

        modalNameInput.id = 'name';
        modalSurnameInput.id = 'surname';
        modalLastnameInput.id = 'lastName';

        placeholderSurnameRequired.textContent = '*';
        placeholderNameRequired.textContent = '*';

        modalNameWrapper.append(modalNameInput);
        modalSurnameWrapper.append(modalSurnameInput);
        modalLastnameWrapper.append(modalLastnameInput);
        modalTopWrapper.append(modalSurnameWrapper, modalNameWrapper, modalLastnameWrapper);

        if (modalType == 'add') {
            modalTopWrapper.classList.add('form__top-add');
            modalNameWrapper.classList.add('form__item-add');
            modalSurnameWrapper.classList.add('form__item-add');
            modalLastnameWrapper.classList.add('form__item-add');

            const placeholderNameText = document.createElement('span');
            const placeholderSurnameText = document.createElement('span');
            const placeholderLastnameText = document.createElement('span');

            placeholderNameText.classList.add('form__placeholder');
            placeholderSurnameText.classList.add('form__placeholder');
            placeholderLastnameText.classList.add('form__placeholder');
            placeholderNameRequired.classList.add('form__placeholder-required');
            placeholderSurnameRequired.classList.add('form__placeholder-required');

            placeholderNameText.textContent = 'Имя';
            placeholderSurnameText.textContent = 'Фамилия';
            placeholderLastnameText.textContent = 'Отчество';

            placeholderNameText.append(placeholderNameRequired);
            placeholderSurnameText.append(placeholderSurnameRequired);

            modalNameWrapper.append(placeholderNameText);
            modalSurnameWrapper.append(placeholderSurnameText);
            modalLastnameWrapper.append(placeholderLastnameText);
        }

        if (modalType == 'change') {
            const modalNameLabel = document.createElement('label');
            const modalSurnameLabel = document.createElement('label');
            const modalLastnameLabel = document.createElement('label');

            modalNameLabel.classList.add('form__label');
            modalSurnameLabel.classList.add('form__label');
            modalLastnameLabel.classList.add('form__label');

            modalNameLabel.textContent = 'Имя';
            modalSurnameLabel.textContent = 'Фамилия';
            modalLastnameLabel.textContent = 'Отчетсво';

            modalNameLabel.setAttribute('for', 'name-change');
            modalSurnameLabel.setAttribute('for', 'surname-change');
            modalLastnameLabel.setAttribute('for', 'lastName-change');

            placeholderNameRequired.classList.add('form__required');
            placeholderSurnameRequired.classList.add('form__required');

            modalNameLabel.append(placeholderNameRequired);
            modalSurnameLabel.append(placeholderSurnameRequired);

            modalNameWrapper.prepend(modalNameLabel);
            modalSurnameWrapper.prepend(modalSurnameLabel);
            modalLastnameWrapper.prepend(modalLastnameLabel);
        }

        return {
            modalTopWrapper,
            modalBottomWrapper,
            modalNameInput,
            modalSurnameInput,
            modalLastnameInput,
        }
    }

    // Отрисовка кпонки добавления контакта 
    function createModalContactButton() {
        const modalMiddleWrapper = document.createElement('div');
        const modalContactsWrapper = document.createElement('div');
        const modalAddContactBtn = document.createElement('button');
        modalMiddleWrapper.classList.add('form__middle');
        modalAddContactBtn.classList.add('button', 'form__add-btn');
        modalAddContactBtn.textContent = ' Добавить контакт';
        modalAddContactBtn.type = 'button'

        modalMiddleWrapper.append(modalContactsWrapper, modalAddContactBtn);

        return {
            modalMiddleWrapper,
            modalAddContactBtn,
            modalContactsWrapper,
        }
    }

    // Отрисовка инпута с контактом
    function createContactInput() {
        const modalContactWrapper = document.createElement('div');
        const modalSelect = document.createElement('select');
        const modalOptionPhone = document.createElement('option');
        const modalOptionEmail = document.createElement('option');
        const modalOptionFb = document.createElement('option');
        const modalOptionVk = document.createElement('option');
        const modalOptionOther = document.createElement('option');
        const modalContactInput = document.createElement('input');
        const modalContactBtn = document.createElement('button');
        const molalContactTooltip = document.createElement('div');

        modalContactWrapper.classList.add('form__contact');
        modalSelect.classList.add('form__contact-select');
        modalContactInput.classList.add('form__contact-input');
        modalContactBtn.classList.add('button', 'form__contact-delete-btn');
        molalContactTooltip.classList.add('tooltip', 'form__contact-tooltip');

        modalSelect.id = 'contact-select';
        modalOptionPhone.text = 'Телефон';
        modalOptionEmail.text = 'Email';
        modalOptionFb.text = 'Facebook';
        modalOptionVk.text = 'Vkontakte';
        modalOptionOther.text = 'Другое';

        modalOptionPhone.value = 'Телефон';
        modalOptionEmail.value = 'Email';
        modalOptionFb.value = 'Facebook';
        modalOptionVk.value = 'Vkontakte';
        modalOptionOther.value = 'Другое';

        modalContactBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z"/></svg>';
        modalContactBtn.type = 'button';
        molalContactTooltip.textContent = 'Удалить контакт';

        modalContactBtn.addEventListener('click', () => {
            modalContactWrapper.remove();
            const contactInputCount = document.querySelectorAll('.form__contact').length;
            const modalMiddleWrapper = document.querySelector('.form__middle');
            const modalAddContactBtn = document.querySelector('.form__add-btn');

            // Удаляем кнопку добавления контакта, если контактов больше 10 и добавляем кнопку в обратном случае
            if (contactInputCount == 0) modalMiddleWrapper.classList.remove('form__middle_with-contacts');
            if (contactInputCount < 10 || modalAddContactBtn.classList.contains('form__add-btn_hidden')) {
                modalAddContactBtn.classList.remove('form__add-btn_hidden');
            }
        })

        modalContactBtn.append(molalContactTooltip);
        modalSelect.append(modalOptionPhone, modalOptionEmail, modalOptionFb, modalOptionVk, modalOptionOther)
        modalContactWrapper.append(modalSelect, modalContactInput, modalContactBtn)

        return {
            modalContactWrapper,
            modalSelect,
            modalContactInput,
        }
    }

    // Открытие модального окна 
    function openModal() {
        setTimeout(() => document.querySelector('.modal').classList.add('modal--open'));
    }

    // Установка обработчиков закрытия форм
    function closeModalListener() {
        //   Закрыть модальное окно при клике вне его
        document.querySelector('.modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal--open')) closeModal()
        });

        // Закрыть модальное окно при нажатии на крестик
        document.querySelector('.modal__close-btn').addEventListener('click', closeModal, { once: true })
    }

    // Закрытие модального окна 
    function closeModal() {
        document.querySelector('.modal').classList.remove('modal--open')
        setTimeout(() => document.querySelector('.modal').remove(), 400)
    }

    // Запуск приложения
    document.addEventListener('DOMContentLoaded', async () => {

        const clientsArr = await serverController.getClientsData();
        document.querySelector('.clients__loading').remove();
        document.querySelector('.clients__add-button').classList.add('clients__add-button_active');

        renderClienstTable(clientsArr);

        // Сортировка по ID по умолчанию
        sortClients('number', 0);

        // Cортировка по заголовку
        document.querySelector('.table__thead').addEventListener('click', (e) => {
            initSortClients(e)
        });

        document.querySelector('.clients__add-button_active').addEventListener('click', () => {
            controlAddModal()
        })

        // Закрыть модальное окно при нажатии Escape
        document.addEventListener('keydown', (e) => {
            if (e.key == 'Escape') {
                if (!(document.querySelector('.modal') === null)) closeModal()
            }
        });

        document.querySelector('.header__search').addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(searchClient, 600);
        })

    })
})()





