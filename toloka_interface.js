// Чтобы изменить название тега, цвет или горячую клавишу, задайте новые значения элемента массива tagsData в фигурных скобках.
var tagsData = [

    {
        'tag_color': 'Синий',
        'tag_name': 'Сущность 1',
        'tag_hotkey': 'q'
    },
    {
        'tag_color': 'Зеленый',
        'tag_name': 'Сущность 2',
        'tag_hotkey': 'w'
    },
    {
     'tag_color': 'Красный',
    'tag_name': 'Сущность 3',
   'tag_hotkey': 'r'
},

    // Чтобы добавить новый тег, раскомментируйте один или несколько элементов массива tagsData в фигурных скобках. Активным по умолчанию будет первый тег в массиве. Чтобы удалить тег, закомментируйте его или удалите.
     {
       'tag_color': 'Коричневый',
      'tag_name': 'Сущность 4',
       'tag_hotkey': 'y'
 },
 {
'tag_color': 'Фиолетовый',
  'tag_name': 'Сущность 5',
   'tag_hotkey': 'u'
    },
{
      'tag_color': 'Оранжевый',
    'tag_name': 'Сущность 6',
      'tag_hotkey': 'i'
    },
    // {
    //   'tag_color': 'Розовый',
    //   'tag_name': 'Розовый',
    //   'tag_hotkey': 'a'
    // },
    // {
    //   'tag_color': 'Бирюзовый',
    //   'tag_name': 'Бирюзовый',
    //   'tag_hotkey': 's'
    // },
];

exports.Task = extend(TolokaHandlebarsTask, function(options) {
    TolokaHandlebarsTask.call(this, options);
}, {
    getTemplateData: function() {
        var data = TolokaHandlebarsTask.prototype.getTemplateData.apply(this, arguments);
        data.tagsData = updateTagsData(tagsData);

        return data;
    },
    onRender: function() {
        this.rendered = true;

        var tagsData = this.getTask().input_values.tagsData;
        createTextAnnotationInterface.call(this, tagsData);
    },
    setSolution: function(solution) {
        TolokaHandlebarsTask.prototype.setSolution.apply(this, arguments);
        var workspaceOptions = this.getWorkspaceOptions();

        if (this.rendered) {
            if (!workspaceOptions.isReviewMode && !workspaceOptions.isReadOnly) {
                if (solution.output_values.result && Object.keys(solution.output_values.result).length > 0) {
                    this.setSolutionOutputValue('no_result', false);
                }
            }
        }
    },
    addError: function(message, field, errors) {
        errors || (errors = {
            task_id: this.getOptions().task.id,
            errors: {}
        });
        errors.errors[field] = {
            message: message
        };

        return errors;
    },

    validate: function(solution) {
        var errors = null;

        // Если не выделено ни одного слова, показываем сообщение об ошибке.

        // if (!solution.output_values.result || Object.keys(solution.output_values.result).length === 0) {
        //     errors = this.addError('Выделите хотя бы одно слово', '__TASK__', errors);
        // }

        if (!solution.output_values.result) {
            this.setSolutionOutputValue('result', {});
            this.setSolutionOutputValue('text_review_mode', []);
        }

        if ((!solution.output_values.result || Object.keys(solution.output_values.result).length === 0) && !solution.output_values.no_result) {
            errors = this.addError('Выделите хотя бы одно слово или выберите вариант ответа "В тексте нет кореферентных сущностей"', '__TASK__', errors);
        }

        return errors || TolokaHandlebarsTask.prototype.validate.call(this, solution);
    },
    onDestroy: function() {
        // Задание завершено, можно освобождать (если были использованы) глобальные ресурсы
    }
});

exports.TaskSuite = extend(TolokaHandlebarsTaskSuite, function(options) {
    TolokaHandlebarsTaskSuite.call(this, options);
}, {
    onRender: function() {
        var taskSuit = this.getTasksDOMElement();
        taskSuit.addEventListener('click', handleTagSelectorBlur.bind(null, taskSuit));
    },
    onDestroy: function() {
        this.storage.clear();
    }
});

function extend(ParentClass, constructorFunction, prototypeHash) {
    constructorFunction = constructorFunction || function() {};
    prototypeHash = prototypeHash || {};
    if (ParentClass) {
        constructorFunction.prototype = Object.create(ParentClass.prototype);
    }
    for (var i in prototypeHash) {
        constructorFunction.prototype[i] = prototypeHash[i];
    }
    return constructorFunction;
}
